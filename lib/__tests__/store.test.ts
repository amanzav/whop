import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { useStore, EscrowStateMachine } from "@/lib/store";
import type { Offer, Order, Task, User } from "@/lib/types";

const day = 86_400_000;
const isoDaysAgo = (n: number) => new Date(Date.now() - n * day).toISOString();

const BUYER = "u_buyer";
const SELLER = "u_seller";

const seller = (): User => ({
  id: SELLER,
  name: "Seller",
  email: "seller@example.com",
  avatar: "",
  bio: "",
  roles: ["Seller"],
  skills: [],
  categoryIds: [],
  ratingAvg: 4.5,
  reviewCount: 0,
  completedOrderCount: 2,
  balance: 100,
  createdAt: isoDaysAgo(100),
});

const task = (overrides: Partial<Task> = {}): Task => ({
  id: "task_1",
  buyerId: BUYER,
  title: "Build a thing",
  description: "",
  categoryId: "cat_a",
  requiredSkills: [],
  budgetMin: 100,
  budgetMax: 300,
  status: "open",
  createdAt: isoDaysAgo(2),
  ...overrides,
});

const offer = (overrides: Partial<Offer> = {}): Offer => ({
  id: "offer_1",
  taskId: "task_1",
  sellerId: SELLER,
  price: 200,
  deliveryDays: 5,
  message: "I can do it",
  status: "pending",
  createdAt: isoDaysAgo(1),
  ...overrides,
});

const order = (overrides: Partial<Order> = {}): Order => ({
  id: "order_1",
  buyerId: BUYER,
  sellerId: SELLER,
  title: "Order",
  amount: 200,
  platformFee: 20,
  status: "in_progress",
  source: "task",
  createdAt: isoDaysAgo(1),
  ...overrides,
});

/** Seed a known minimal state without dropping action functions (merge mode). */
const seedState = (partial: {
  users?: User[];
  tasks?: Task[];
  offers?: Offer[];
  orders?: Order[];
}) => {
  useStore.setState({
    users: partial.users ?? [seller()],
    categories: [],
    services: [],
    tasks: partial.tasks ?? [],
    offers: partial.offers ?? [],
    orders: partial.orders ?? [],
    reviews: [],
    messages: [],
    // Signed-in actor for actions that need a current user.
    currentUserId: SELLER,
    role: "seller",
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("EscrowStateMachine.canTransition", () => {
  it("allows the forward-only legal transitions", () => {
    expect(EscrowStateMachine.canTransition("held", "in_progress")).toBe(true);
    expect(EscrowStateMachine.canTransition("held", "cancelled")).toBe(true);
    expect(EscrowStateMachine.canTransition("in_progress", "delivered")).toBe(true);
    expect(EscrowStateMachine.canTransition("in_progress", "cancelled")).toBe(true);
    expect(EscrowStateMachine.canTransition("delivered", "released")).toBe(true);
  });

  it("rejects illegal transitions", () => {
    expect(EscrowStateMachine.canTransition("held", "delivered")).toBe(false);
    expect(EscrowStateMachine.canTransition("delivered", "cancelled")).toBe(false);
    expect(EscrowStateMachine.canTransition("released", "delivered")).toBe(false);
    expect(EscrowStateMachine.canTransition("cancelled", "in_progress")).toBe(false);
    expect(EscrowStateMachine.canTransition("released", "released")).toBe(false);
  });
});

describe("acceptOffer", () => {
  it("creates exactly one in_progress order, assigns the task, and declines sibling offers", () => {
    const accepted = offer({ id: "offer_a", sellerId: SELLER });
    const sibling = offer({ id: "offer_b", sellerId: "u_other" });
    seedState({
      tasks: [task()],
      offers: [accepted, sibling],
      orders: [],
    });

    const orderId = useStore.getState().acceptOffer("offer_a");
    expect(orderId).not.toBeNull();

    const s = useStore.getState();
    expect(s.orders).toHaveLength(1);
    expect(s.orders[0].status).toBe("in_progress");
    expect(s.orders[0].id).toBe(orderId);
    expect(s.orders[0].amount).toBe(200);

    expect(s.tasks[0].status).toBe("assigned");

    expect(s.offers.find((o) => o.id === "offer_a")!.status).toBe("accepted");
    expect(s.offers.find((o) => o.id === "offer_b")!.status).toBe("declined");
  });

  it("returns null for a non-pending offer (no order created)", () => {
    seedState({
      tasks: [task()],
      offers: [offer({ status: "declined" })],
      orders: [],
    });
    expect(useStore.getState().acceptOffer("offer_1")).toBeNull();
    expect(useStore.getState().orders).toHaveLength(0);
  });
});

describe("markDelivered", () => {
  it("advances an in_progress order to delivered", () => {
    seedState({ orders: [order({ status: "in_progress" })] });
    useStore.getState().markDelivered("order_1");
    expect(useStore.getState().orders[0].status).toBe("delivered");
  });

  it("is a silent no-op from a non-in_progress state", () => {
    seedState({ orders: [order({ status: "held" })] });
    expect(() => useStore.getState().markDelivered("order_1")).not.toThrow();
    expect(useStore.getState().orders[0].status).toBe("held");
  });
});

describe("releaseEscrow", () => {
  it("releases from delivered, credits the seller balance, and increments completed count", () => {
    seedState({
      users: [seller()],
      orders: [order({ status: "delivered", amount: 200 })],
    });
    useStore.getState().releaseEscrow("order_1");

    const s = useStore.getState();
    expect(s.orders[0].status).toBe("released");
    const u = s.users.find((x) => x.id === SELLER)!;
    expect(u.balance).toBe(300); // 100 + 200
    expect(u.completedOrderCount).toBe(3); // 2 + 1
  });

  it("unlocks review eligibility only once status is released", () => {
    seedState({ orders: [order({ status: "in_progress" })] });
    // Not yet deliverable -> release is a no-op, status unchanged.
    useStore.getState().releaseEscrow("order_1");
    expect(useStore.getState().orders[0].status).toBe("in_progress");

    // Proper path: deliver then release => released (review-eligible).
    useStore.getState().markDelivered("order_1");
    useStore.getState().releaseEscrow("order_1");
    expect(useStore.getState().orders[0].status).toBe("released");
  });

  it("is a silent no-op from a non-delivered state", () => {
    seedState({
      users: [seller()],
      orders: [order({ status: "in_progress", amount: 200 })],
    });
    expect(() => useStore.getState().releaseEscrow("order_1")).not.toThrow();
    const s = useStore.getState();
    expect(s.orders[0].status).toBe("in_progress");
    expect(s.users[0].balance).toBe(100); // unchanged
  });
});

describe("cancelOrder", () => {
  it("cancels from held", () => {
    seedState({ orders: [order({ status: "held" })] });
    useStore.getState().cancelOrder("order_1");
    expect(useStore.getState().orders[0].status).toBe("cancelled");
  });

  it("cancels from in_progress", () => {
    seedState({ orders: [order({ status: "in_progress" })] });
    useStore.getState().cancelOrder("order_1");
    expect(useStore.getState().orders[0].status).toBe("cancelled");
  });

  it("is a silent no-op from delivered", () => {
    seedState({ orders: [order({ status: "delivered" })] });
    expect(() => useStore.getState().cancelOrder("order_1")).not.toThrow();
    expect(useStore.getState().orders[0].status).toBe("delivered");
  });

  it("is a silent no-op from released", () => {
    seedState({ orders: [order({ status: "released" })] });
    expect(() => useStore.getState().cancelOrder("order_1")).not.toThrow();
    expect(useStore.getState().orders[0].status).toBe("released");
  });
});
