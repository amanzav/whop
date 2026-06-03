import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

import { seed } from "@/lib/data/seed";
import type {
  Category,
  Message,
  Offer,
  Order,
  OrderStatus,
  PackageTier,
  Review,
  Role,
  Service,
  Task,
  User,
} from "@/lib/types";

/** Platform fee taken on every order, disclosed at checkout. */
export const PLATFORM_FEE_RATE = 0.1;

const STORE_KEY = "whop-store";

const genId = (prefix: string): string => {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}_${rand}`;
};

const nowIso = () => new Date().toISOString();

// --- Escrow state machine -------------------------------------------------
// Forward-only transitions. cancelled is reachable from held and in_progress.
const LEGAL_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  held: ["in_progress", "cancelled"],
  in_progress: ["delivered", "cancelled"],
  delivered: ["released"],
  released: [],
  cancelled: [],
};

export const EscrowStateMachine = {
  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return LEGAL_TRANSITIONS[from]?.includes(to) ?? false;
  },
};

// --- Action input shapes --------------------------------------------------
export interface PostTaskInput {
  title: string;
  categoryId: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  requiredSkills?: string[];
}

export interface SubmitOfferInput {
  price: number;
  deliveryDays: number;
  message: string;
  matchScore?: number;
}

export interface AddReviewInput {
  orderId: string;
  authorId: string;
  targetId: string;
  rating: number;
  comment: string;
  direction: Review["direction"];
}

interface DomainState {
  users: User[];
  categories: Category[];
  services: Service[];
  tasks: Task[];
  offers: Offer[];
  orders: Order[];
  reviews: Review[];
  messages: Message[];
  /** Active role context for the signed-in user. */
  role: Role;
  /** Signed-in user id, hydrated from the NextAuth session. null = Guest. */
  currentUserId: string | null;

  setRole: (role: Role) => void;
  /**
   * Sync the signed-in identity from the auth session. Passing a user id signs
   * in (defaulting the role to "buyer"); passing null signs out. The role only
   * resets when the identity actually changes, preserving a chosen role across
   * reloads of the same session.
   */
  setCurrentUser: (userId: string | null) => void;

  postTask: (data: PostTaskInput) => Task | null;
  submitOffer: (taskId: string, data: SubmitOfferInput) => Offer | null;
  acceptOffer: (offerId: string) => string | null;
  buyGig: (serviceId: string, packageTier: PackageTier) => string | null;
  markDelivered: (orderId: string) => void;
  releaseEscrow: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  addReview: (data: AddReviewInput) => Review | null;
  sendMessage: (orderId: string, senderId: string, body: string) => void;
}

const recomputeUserRating = (
  users: User[],
  reviews: Review[],
  targetId: string,
): User[] => {
  const received = reviews.filter((r) => r.targetId === targetId);
  if (received.length === 0) return users;
  const avg =
    received.reduce((sum, r) => sum + r.rating, 0) / received.length;
  return users.map((u) =>
    u.id === targetId
      ? {
          ...u,
          ratingAvg: Math.round(avg * 100) / 100,
          reviewCount: received.length,
        }
      : u,
  );
};

export const useStore = create<DomainState>()(
  persist(
    (set, get) => ({
      users: seed.users,
      categories: seed.categories,
      services: seed.services,
      tasks: seed.tasks,
      offers: seed.offers,
      orders: seed.orders,
      reviews: seed.reviews,
      messages: seed.messages,
      role: "buyer",
      currentUserId: null,

      setRole: (role) => set({ role }),

      setCurrentUser: (userId) => {
        if (userId === get().currentUserId) return;
        set({
          currentUserId: userId,
          role: userId ? "buyer" : get().role,
        });
      },

      postTask: (data) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return null;
        const task: Task = {
          id: genId("task"),
          buyerId: currentUserId,
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          requiredSkills: data.requiredSkills ?? [],
          budgetMin: data.budgetMin,
          budgetMax: data.budgetMax,
          status: "open",
          createdAt: nowIso(),
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return task;
      },

      submitOffer: (taskId, data) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return null;
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return null;
        const offer: Offer = {
          id: genId("offer"),
          taskId,
          sellerId: currentUserId,
          price: data.price,
          deliveryDays: data.deliveryDays,
          message: data.message,
          status: "pending",
          matchScore: data.matchScore,
          createdAt: nowIso(),
        };
        set((s) => ({ offers: [offer, ...s.offers] }));
        // Notify the buyer who owns this task.
        toast.success("New offer received", {
          description: `An offer was submitted on "${task.title}".`,
        });
        return offer;
      },

      acceptOffer: (offerId) => {
        const state = get();
        const offer = state.offers.find((o) => o.id === offerId);
        if (!offer || offer.status !== "pending") return null;
        const task = state.tasks.find((t) => t.id === offer.taskId);
        if (!task) return null;

        const amount = offer.price;
        const platformFee = Math.round(amount * PLATFORM_FEE_RATE);
        const order: Order = {
          id: genId("order"),
          buyerId: task.buyerId,
          sellerId: offer.sellerId,
          title: task.title,
          amount,
          platformFee,
          // Created at held, immediately advanced to in_progress.
          status: "in_progress",
          source: "task",
          taskId: task.id,
          offerId: offer.id,
          createdAt: nowIso(),
        };

        set((s) => ({
          orders: [order, ...s.orders],
          offers: s.offers.map((o) => {
            if (o.id === offerId) return { ...o, status: "accepted" };
            if (o.taskId === task.id && o.status === "pending")
              return { ...o, status: "declined" };
            return o;
          }),
          tasks: s.tasks.map((t) =>
            t.id === task.id ? { ...t, status: "assigned" } : t,
          ),
        }));

        toast.success("Offer accepted", {
          description: `Your offer on "${task.title}" was accepted. Order created.`,
        });
        return order.id;
      },

      buyGig: (serviceId, packageTier) => {
        const state = get();
        if (!state.currentUserId) return null;
        const service = state.services.find((sv) => sv.id === serviceId);
        if (!service) return null;
        const pkg = service.packages.find((p) => p.tier === packageTier);
        if (!pkg) return null;

        const platformFee = Math.round(pkg.price * PLATFORM_FEE_RATE);
        const order: Order = {
          id: genId("order"),
          buyerId: state.currentUserId,
          sellerId: service.sellerId,
          title: `${pkg.name} — ${service.title}`,
          amount: pkg.price,
          platformFee,
          // Held immediately advances to in_progress.
          status: "in_progress",
          source: "gig",
          serviceId: service.id,
          packageTier,
          createdAt: nowIso(),
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        toast.success("Order placed", {
          description: `Payment for "${service.title}" is held in escrow.`,
        });
        return order.id;
      },

      markDelivered: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order || !EscrowStateMachine.canTransition(order.status, "delivered"))
          return;
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, status: "delivered" } : o,
          ),
        }));
        toast.success("Marked as delivered", {
          description: "The buyer has been asked to review and release payment.",
        });
      },

      releaseEscrow: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order || !EscrowStateMachine.canTransition(order.status, "released"))
          return;
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, status: "released" } : o,
          ),
          users: s.users.map((u) =>
            u.id === order.sellerId
              ? {
                  ...u,
                  balance: u.balance + order.amount,
                  completedOrderCount: u.completedOrderCount + 1,
                }
              : u,
          ),
        }));
        toast.success("Escrow released", {
          description: "Payment was released to the seller. You can now leave a review.",
        });
      },

      cancelOrder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order || !EscrowStateMachine.canTransition(order.status, "cancelled"))
          return;
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" } : o,
          ),
        }));
      },

      addReview: (data) => {
        const exists = get().reviews.some(
          (r) => r.orderId === data.orderId && r.direction === data.direction,
        );
        if (exists) return null;
        const review: Review = {
          id: genId("rev"),
          orderId: data.orderId,
          authorId: data.authorId,
          targetId: data.targetId,
          rating: data.rating,
          comment: data.comment,
          direction: data.direction,
          createdAt: nowIso(),
        };
        set((s) => {
          const reviews = [review, ...s.reviews];
          return {
            reviews,
            users: recomputeUserRating(s.users, reviews, data.targetId),
          };
        });
        return review;
      },

      sendMessage: (orderId, senderId, body) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        const message: Message = {
          id: genId("msg"),
          orderId,
          senderId,
          body: trimmed,
          createdAt: nowIso(),
        };
        set((s) => ({ messages: [...s.messages, message] }));
      },
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      // Persist domain data + persona; actions are not serialized.
      partialize: (s) => ({
        users: s.users,
        categories: s.categories,
        services: s.services,
        tasks: s.tasks,
        offers: s.offers,
        orders: s.orders,
        reviews: s.reviews,
        messages: s.messages,
        role: s.role,
        currentUserId: s.currentUserId,
      }),
    },
  ),
);
