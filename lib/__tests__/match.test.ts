import { describe, it, expect } from "vitest";

import {
  scoreMatch,
  rankSellersForTask,
  SCORE_MIN,
  SCORE_MAX,
} from "@/lib/match";
import type { Task, User } from "@/lib/types";

const day = 86_400_000;
const isoDaysAgo = (n: number) => new Date(Date.now() - n * day).toISOString();

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: "u_test",
  name: "Test Seller",
  email: "test@example.com",
  avatar: "",
  bio: "",
  roles: ["Seller"],
  skills: [],
  categoryIds: [],
  ratingAvg: 4.5,
  reviewCount: 10,
  completedOrderCount: 10,
  balance: 0,
  createdAt: isoDaysAgo(200),
  ...overrides,
});

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task_test",
  buyerId: "u_buyer",
  title: "Test task",
  description: "",
  categoryId: "cat_a",
  requiredSkills: ["React", "Node"],
  budgetMin: 200,
  budgetMax: 400,
  status: "open",
  createdAt: isoDaysAgo(2),
  ...overrides,
});

describe("scoreMatch", () => {
  it("scores a same-category, skill-overlapping seller higher than an unrelated seller", () => {
    const task = makeTask({
      categoryId: "cat_a",
      requiredSkills: ["React", "Node"],
    });
    const goodSeller = makeUser({
      id: "u_good",
      categoryIds: ["cat_a"],
      skills: ["React", "Node"],
    });
    const unrelatedSeller = makeUser({
      id: "u_bad",
      categoryIds: ["cat_z"],
      skills: ["Welding", "Plumbing"],
    });

    expect(scoreMatch(task, goodSeller).score).toBeGreaterThan(
      scoreMatch(task, unrelatedSeller).score,
    );
  });

  it("scores a budget within range higher than a budget far outside range", () => {
    // impliedRate for completedOrderCount 10 => 150 + 10*8 = 230.
    // Keep category + skills + rating identical so only budget differs.
    const seller = makeUser({
      categoryIds: ["cat_a"],
      skills: ["React", "Node"],
    });
    const inRangeTask = makeTask({ budgetMin: 200, budgetMax: 260 }); // midpoint 230 == rate
    const farOutTask = makeTask({ budgetMin: 5000, budgetMax: 6000 }); // midpoint 5500 >> rate

    expect(scoreMatch(inRangeTask, seller).score).toBeGreaterThan(
      scoreMatch(farOutTask, seller).score,
    );
  });

  it("ranks a higher-rated seller above a lower-rated one when else equal", () => {
    const task = makeTask();
    const base = {
      categoryIds: ["cat_a"],
      skills: ["React", "Node"],
      completedOrderCount: 10,
      createdAt: isoDaysAgo(200),
    };
    const highRated = makeUser({ id: "u_hi", ratingAvg: 5, ...base });
    const lowRated = makeUser({ id: "u_lo", ratingAvg: 3, ...base });

    expect(scoreMatch(task, highRated).score).toBeGreaterThan(
      scoreMatch(task, lowRated).score,
    );
  });

  it("always clamps the score to [60, 99]", () => {
    const task = makeTask();
    const sellers = [
      makeUser({ categoryIds: [], skills: [], ratingAvg: 0, completedOrderCount: 0, createdAt: isoDaysAgo(2000) }),
      makeUser({ categoryIds: ["cat_a"], skills: ["React", "Node"], ratingAvg: 5, completedOrderCount: 50, createdAt: isoDaysAgo(0) }),
      makeUser({ categoryIds: ["cat_a"], skills: ["React"], ratingAvg: 4.2, completedOrderCount: 5 }),
    ];
    for (const seller of sellers) {
      const { score } = scoreMatch(task, seller);
      expect(score).toBeGreaterThanOrEqual(SCORE_MIN);
      expect(score).toBeLessThanOrEqual(SCORE_MAX);
    }
  });

  it("returns a non-empty reasons array referencing real factors", () => {
    const task = makeTask({ categoryId: "cat_a", requiredSkills: ["React", "Node"] });
    const seller = makeUser({
      categoryIds: ["cat_a"],
      skills: ["React", "Node"],
      ratingAvg: 4.95,
    });
    const { reasons } = scoreMatch(task, seller);
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons).toContain("Same category");
    // skill overlap of 2 required skills
    expect(reasons.some((r) => r.includes("required skill"))).toBe(true);
    expect(reasons).toContain("Highly rated");
  });

  it("reasons is non-empty even for a totally unrelated seller", () => {
    const task = makeTask({ categoryId: "cat_a", requiredSkills: ["React"] });
    const seller = makeUser({
      categoryIds: ["cat_z"],
      skills: ["Welding"],
      ratingAvg: 0,
      completedOrderCount: 0,
      createdAt: isoDaysAgo(2000),
    });
    const { reasons } = scoreMatch(task, seller);
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons).toContain("Open to new work");
  });
});

describe("rankSellersForTask", () => {
  it("returns sellers in descending-by-score order", () => {
    const task = makeTask({ categoryId: "cat_a", requiredSkills: ["React", "Node"] });
    const strong = makeUser({ id: "u_strong", categoryIds: ["cat_a"], skills: ["React", "Node"], ratingAvg: 5 });
    const medium = makeUser({ id: "u_medium", categoryIds: ["cat_a"], skills: ["React"], ratingAvg: 4.2 });
    const weak = makeUser({ id: "u_weak", categoryIds: ["cat_z"], skills: [], ratingAvg: 2 });

    const ranked = rankSellersForTask(task, [weak, medium, strong]);
    const scores = ranked.map((s) => scoreMatch(task, s).score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
    expect(ranked[0].id).toBe("u_strong");
  });

  it("is stable for sellers with equal scores", () => {
    const task = makeTask();
    // Two identical-profile sellers => identical scores; original order preserved.
    const profile = {
      categoryIds: ["cat_a"],
      skills: ["React", "Node"],
      ratingAvg: 4.5,
      completedOrderCount: 10,
      createdAt: isoDaysAgo(200),
    };
    const a = makeUser({ id: "u_a", ...profile });
    const b = makeUser({ id: "u_b", ...profile });
    expect(scoreMatch(task, a).score).toBe(scoreMatch(task, b).score);

    const ranked = rankSellersForTask(task, [a, b]);
    expect(ranked.map((s) => s.id)).toEqual(["u_a", "u_b"]);

    const rankedReversed = rankSellersForTask(task, [b, a]);
    expect(rankedReversed.map((s) => s.id)).toEqual(["u_b", "u_a"]);
  });
});
