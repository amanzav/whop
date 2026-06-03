"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClipboardList, Plus } from "lucide-react";

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { CategoryPills } from "@/components/category-pills";
import { TaskCard } from "@/components/task-card";

export default function TaskBoardPage() {
  // useSearchParams() requires a Suspense boundary during prerendering.
  return (
    <Suspense>
      <TaskBoardController />
    </Suspense>
  );
}

function TaskBoardController() {
  const tasks = useStore((s) => s.tasks);
  const categories = useStore((s) => s.categories);
  const offers = useStore((s) => s.offers);
  const currentUserId = useStore((s) => s.currentUserId);
  const role = useStore((s) => s.role);

  const searchParams = useSearchParams();
  const mine = searchParams.get("mine") === "1";

  const isBuyer = !!currentUserId && role === "buyer";
  const isSeller = !!currentUserId && role === "seller";

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) map.set(category.id, category.name);
    return map;
  }, [categories]);

  const offerCountByTaskId = useMemo(() => {
    const map = new Map<string, number>();
    for (const offer of offers) {
      map.set(offer.taskId, (map.get(offer.taskId) ?? 0) + 1);
    }
    return map;
  }, [offers]);

  // Task ids the signed-in seller has submitted an offer on (for "My Offers").
  const myOfferedTaskIds = useMemo(() => {
    if (!currentUserId) return new Set<string>();
    return new Set(
      offers.filter((o) => o.sellerId === currentUserId).map((o) => o.taskId),
    );
  }, [offers, currentUserId]);

  const baseTasks = useMemo(() => {
    // Seller "My Offers" view: tasks this seller has offered on (any status).
    if (isSeller && mine) {
      return tasks.filter((task) => myOfferedTaskIds.has(task.id));
    }
    // Default: all open tasks.
    return tasks.filter((task) => task.status === "open");
  }, [tasks, isSeller, mine, myOfferedTaskIds]);

  const filtered = useMemo(
    () =>
      activeCategoryId
        ? baseTasks.filter((task) => task.categoryId === activeCategoryId)
        : baseTasks,
    [baseTasks, activeCategoryId],
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Task Board
            </h1>
            <p className="text-base text-muted-foreground">
              Browse open buyer tasks and send an offer on work that matches
              your skills.
            </p>
          </div>
          {isBuyer && (
            <Button asChild>
              <Link href="/post">
                <Plus />
                Post a Task
              </Link>
            </Button>
          )}
        </div>

        <CategoryPills
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />
      </section>

      <section className="mt-8">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                categoryName={categoryNameById.get(task.categoryId) ?? "Other"}
                offerCount={offerCountByTaskId.get(task.id) ?? 0}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
            <ClipboardList className="size-8 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <p className="font-heading text-base font-medium text-foreground">
                No open tasks
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {activeCategoryId
                  ? "No open tasks in this category right now. Try another category."
                  : "There are no open tasks right now. Check back soon."}
              </p>
            </div>
            {isBuyer && (
              <Button asChild>
                <Link href="/post">
                  <Plus />
                  Post a Task
                </Link>
              </Button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
