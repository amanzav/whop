"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FieldErrors {
  title?: string;
  categoryId?: string;
  description?: string;
  budgetMin?: string;
  budgetMax?: string;
}

export default function PostTaskController() {
  const router = useRouter();
  const currentUserId = useStore((s) => s.currentUserId);
  const role = useStore((s) => s.role);
  const categories = useStore((s) => s.categories);
  const postTask = useStore((s) => s.postTask);

  const isBuyer = !!currentUserId && role === "buyer";

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  if (!isBuyer) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
          <Lock className="size-8 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <p className="font-heading text-base font-medium text-foreground">
              {currentUserId
                ? "Switch to Buyer role to post a task"
                : "Sign in as a buyer to post a task"}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {currentUserId
                ? "Posting a task is only available in the Buyer role. Switch to the Buyer role, then post the work you need done."
                : "Posting a task requires signing in as a buyer. Sign in to post the work you need done."}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={currentUserId ? "/tasks" : "/signin"}>
              {currentUserId ? "Back to Task Board" : "Sign in"}
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: FieldErrors = {};

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const min = Number(budgetMin);
    const max = Number(budgetMax);

    if (!trimmedTitle) nextErrors.title = "Title is required.";
    if (!categoryId) nextErrors.categoryId = "Category is required.";
    if (!trimmedDescription)
      nextErrors.description = "Description is required.";

    if (budgetMin.trim() === "") {
      nextErrors.budgetMin = "Minimum budget is required.";
    } else if (!Number.isFinite(min) || min <= 0) {
      nextErrors.budgetMin = "Enter a budget greater than 0.";
    }

    if (budgetMax.trim() === "") {
      nextErrors.budgetMax = "Maximum budget is required.";
    } else if (!Number.isFinite(max) || max <= 0) {
      nextErrors.budgetMax = "Enter a budget greater than 0.";
    } else if (
      !nextErrors.budgetMin &&
      Number.isFinite(min) &&
      max < min
    ) {
      nextErrors.budgetMax = "Maximum must be greater than or equal to minimum.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const created = postTask({
      title: trimmedTitle,
      categoryId,
      description: trimmedDescription,
      budgetMin: min,
      budgetMax: max,
    });
    if (created) router.push(`/task/${created.id}`);
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Post a Task
        </h1>
        <p className="text-base text-muted-foreground">
          Describe the work you need done and your budget. Sellers will send you
          offers.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Build a Telegram trading bot for my signals group"
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger
              id="category"
              className="h-10 w-full"
              aria-invalid={Boolean(errors.categoryId)}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-destructive">{errors.categoryId}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you need, the scope, and any requirements."
            className="min-h-32"
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="budgetMin">Budget minimum</Label>
            <Input
              id="budgetMin"
              type="number"
              min={0}
              inputMode="numeric"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="200"
              aria-invalid={Boolean(errors.budgetMin)}
            />
            {errors.budgetMin && (
              <p className="text-sm text-destructive">{errors.budgetMin}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="budgetMax">Budget maximum</Label>
            <Input
              id="budgetMax"
              type="number"
              min={0}
              inputMode="numeric"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="500"
              aria-invalid={Boolean(errors.budgetMax)}
            />
            {errors.budgetMax && (
              <p className="text-sm text-destructive">{errors.budgetMax}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" size="lg">
            Post Task
          </Button>
          <Button asChild type="button" variant="ghost" size="lg">
            <Link href="/tasks">Cancel</Link>
          </Button>
        </div>
      </form>
    </main>
  );
}
