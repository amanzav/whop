"use client";

import { useEffect, useRef } from "react";
import { Send } from "lucide-react";

import type { Message, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatThreadProps {
  /** Messages to render, expected in chronological order. */
  messages: Message[];
  /** Users used to resolve sender display names. */
  users: User[];
  /** The active sender's user id (their messages are accent-aligned). */
  currentSenderId: string;
  /** Current compose input value. */
  value: string;
  /** Called when the compose input changes. */
  onChange: (value: string) => void;
  /** Called when the user submits a (non-empty) message. */
  onSend: () => void;
}

/**
 * Presentational chat thread. Scoped purely to the messages it is given —
 * it never reads the store and never sends empty messages.
 */
export function ChatThread({
  messages,
  users,
  currentSenderId,
  value,
  onChange,
  onSend,
}: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the latest message in view as the thread grows.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const senderName = (senderId: string): string =>
    users.find((u) => u.id === senderId)?.name ?? "Unknown user";

  const handleSend = () => {
    if (!value.trim()) return;
    onSend();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentSenderId;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col gap-1",
                  isOwn ? "items-end" : "items-start",
                )}
              >
                <div className="flex items-baseline gap-2 px-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {senderName(message.senderId)}
                  </span>
                  <span>{formatRelativeTime(new Date(message.createdAt))}</span>
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {message.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message…"
          aria-label="Message"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!value.trim()}
          aria-label="Send message"
        >
          <Send />
        </Button>
      </div>
    </div>
  );
}
