import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <span className="rounded-full bg-lemon px-3 py-1 text-xs font-semibold text-lemon-foreground">
        Whop Marketplace
      </span>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Hire vetted sellers. Commission custom work.
      </h1>
      <p className="max-w-md text-base text-muted-foreground">
        The brand theme is configured. Feature surfaces land in the following
        work orders.
      </p>
      <Button size="lg">Browse gigs</Button>
    </main>
  );
}
