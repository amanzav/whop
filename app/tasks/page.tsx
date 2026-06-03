"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { CategoryPills } from "@/components/category-pills";
import { TaskCard } from "@/components/task-card";

export default function TaskBoardController() {
  const tasks = useStore((s) => s.tasks);
  const categories = useStore((s) => s.categories);
  const offers = useStore((s) => s.offers);
  const persona = useStore((s) => s.persona);

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

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status === "open"),
    [tasks],
  );

  const filtered = useMemo(
    () =>
      activeCategoryId
        ? openTasks.filter((task) => task.categoryId === activeCategoryId)
        : openTasks,
    [openTasks, activeCategoryId],
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
          {persona === "buyer" && (
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
            {persona === "buyer" && (
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
