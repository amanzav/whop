// Pure, deterministic match engine. No React, no Zustand, no I/O.
// Callers fetch entities from the store and pass them in as plain arguments.

import type { Task, User } from "@/lib/types";

export interface MatchResult {
  score: number;
  reasons: string[];
}

export const SCORE_MIN = 60;
export const SCORE_MAX = 99;

const WEIGHTS = {
  category: 0.35,
  skill: 0.25,
  budget: 0.2,
  rating: 0.15,
  recency: 0.05,
} as const;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const DAY = 86_400_000;

/** Implied day-rate for a seller, derived from their track record. */
const impliedRate = (seller: User): number =>
  150 + Math.min(seller.completedOrderCount, 50) * 8;

/**
 * Score how well a seller matches a task. Pure and deterministic — identical
 * inputs always produce identical outputs. Result is clamped to [60, 99].
 */
export function scoreMatch(task: Task, seller: User): MatchResult {
  // 35% — category match
  const categoryScore = seller.categoryIds.includes(task.categoryId) ? 1 : 0;

  // 25% — skill overlap
  const required = task.requiredSkills;
  const overlap = required.filter((s) =>
    seller.skills.some((sk) => sk.toLowerCase() === s.toLowerCase()),
  ).length;
  const skillScore = required.length === 0 ? 0.5 : overlap / required.length;

  // 20% — budget fit (closeness of task midpoint to the seller's implied rate)
  const midpoint = (task.budgetMin + task.budgetMax) / 2;
  const rate = impliedRate(seller);
  const budgetScore = clamp(1 - Math.abs(midpoint - rate) / rate, 0, 1);

  // 15% — rating normalization
  const ratingScore = clamp(seller.ratingAvg / 5, 0, 1);

  // 5% — recency (newer seller accounts read as freshly active)
  const daysSince = (Date.now() - new Date(seller.createdAt).getTime()) / DAY;
  const recencyScore = clamp(1 - daysSince / 730, 0, 1);

  const raw =
    WEIGHTS.category * categoryScore +
    WEIGHTS.skill * skillScore +
    WEIGHTS.budget * budgetScore +
    WEIGHTS.rating * ratingScore +
    WEIGHTS.recency * recencyScore;

  const score = clamp(Math.round(raw * 100), SCORE_MIN, SCORE_MAX);

  const reasons: string[] = [];
  if (categoryScore === 1) reasons.push("Same category");
  if (overlap > 0)
    reasons.push(
      overlap === 1 ? "Shares a required skill" : `Shares ${overlap} required skills`,
    );
  if (budgetScore > 0.6) reasons.push("Budget within range");
  if (ratingScore >= 0.9) reasons.push("Highly rated");
  else if (ratingScore >= 0.8) reasons.push("Strong reviews");
  if (recencyScore > 0.85) reasons.push("Recently active");

  // reasons is always non-empty.
  if (reasons.length === 0) reasons.push("Open to new work");

  return { score, reasons };
}

/**
 * Rank sellers for a task by descending match score. Stable: equal scores keep
 * their original relative order.
 */
export function rankSellersForTask(task: Task, sellers: User[]): User[] {
  return sellers
    .map((seller, index) => ({ seller, index, score: scoreMatch(task, seller).score }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.seller);
}
