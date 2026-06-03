import Link from "next/link";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { Task } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  task: Task;
  categoryName: string;
  offerCount: number;
}

export function TaskCard({ task, categoryName, offerCount }: TaskCardProps) {
  return (
    <Link
      href={`/task/${task.id}`}
      className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card
        size="sm"
        className={cn(
          "h-full transition-all hover:ring-foreground/20",
          "hover:-translate-y-0.5 hover:shadow-lg",
        )}
      >
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            {categoryName}
          </Badge>
          <CardTitle className="mt-2 line-clamp-2">{task.title}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {task.description}
          </p>
        </CardContent>

        <CardFooter className="justify-between">
          <span className="font-heading text-base font-semibold text-foreground">
            {formatCurrency(task.budgetMin)} – {formatCurrency(task.budgetMax)}
          </span>
          <span className="text-xs text-muted-foreground">
            {offerCount} {offerCount === 1 ? "offer" : "offers"}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
