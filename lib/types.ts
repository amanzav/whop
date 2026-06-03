// Domain types for the Whop Marketplace in-memory data layer.
// Dates are stored as ISO strings so the full state serializes cleanly to
// localStorage via the Zustand persist middleware.

// Authenticated users act in one of two role contexts. Unauthenticated
// visitors are "Guest" — represented by a null currentUserId, not a role value.
export type Role = "buyer" | "seller";

export type OrderStatus =
  | "held"
  | "in_progress"
  | "delivered"
  | "released"
  | "cancelled";

export type TaskStatus = "open" | "assigned" | "completed" | "cancelled";

export type OfferStatus = "pending" | "accepted" | "declined" | "withdrawn";

export type LevelTier = "new" | "level1" | "level2" | "top_rated";

export type PackageTier = "basic" | "standard" | "premium";

export type ReviewDirection = "of_seller" | "of_buyer";

export interface User {
  id: string;
  name: string;
  /** Login email for the credentials provider. */
  email: string;
  avatar: string;
  bio: string;
  /** Human-readable role capabilities, e.g. ["Buyer", "Seller"]. */
  roles: string[];
  /** Skills the seller offers; used by the match engine. */
  skills: string[];
  /** Category ids the seller works in. */
  categoryIds: string[];
  ratingAvg: number;
  reviewCount: number;
  completedOrderCount: number;
  /** Released earnings balance in dollars. */
  balance: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  /** lucide-react icon name (resolved by the UI). */
  icon: string;
}

export interface ServicePackage {
  tier: PackageTier;
  name: string;
  price: number;
  deliveryDays: number;
  features: string[];
}

export interface Service {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  categoryId: string;
  images: string[];
  packages: ServicePackage[];
  ratingAvg: number;
  reviewCount: number;
  createdAt: string;
}

export interface Task {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  categoryId: string;
  requiredSkills: string[];
  budgetMin: number;
  budgetMax: number;
  status: TaskStatus;
  createdAt: string;
}

export interface Offer {
  id: string;
  taskId: string;
  sellerId: string;
  price: number;
  deliveryDays: number;
  /** Pitch message from the seller. */
  message: string;
  status: OfferStatus;
  /** Snapshot match score for seed display; live score is computed at render. */
  matchScore?: number;
  createdAt: string;
}

export type OrderSource = "gig" | "task";

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  title: string;
  amount: number;
  platformFee: number;
  status: OrderStatus;
  source: OrderSource;
  /** Set when source is "gig". */
  serviceId?: string;
  packageTier?: PackageTier;
  /** Set when source is "task". */
  taskId?: string;
  offerId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  authorId: string;
  targetId: string;
  rating: number;
  comment: string;
  direction: ReviewDirection;
  createdAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  body: string;
  createdAt: string;
}
