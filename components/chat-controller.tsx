"use client";

import { useMemo, useState } from "react";

import { useStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatThread } from "@/components/chat-thread";

interface ChatControllerProps {
  /** Order whose chat thread is shown. The only context prop. */
  orderId: string;
}

/**
 * Order-scoped chat. Reads the order's messages and the active sender from the
 * store, owns the compose input state, and dispatches sendMessage on submit.
 * Available to both buyer and seller regardless of escrow status.
 */
export function ChatController({ orderId }: ChatControllerProps) {
  const messages = useStore((s) => s.messages);
  const users = useStore((s) => s.users);
  const persona = useStore((s) => s.persona);
  const buyerUserId = useStore((s) => s.buyerUserId);
  const sellerUserId = useStore((s) => s.sellerUserId);
  const sendMessage = useStore((s) => s.sendMessage);

  const [draft, setDraft] = useState("");

  // Buyer and guest act as the buyer participant; seller acts as the seller.
  const senderId = persona === "seller" ? sellerUserId : buyerUserId;

  // Scope to this order and sort chronologically (defensive — appended in order).
  const orderMessages = useMemo(
    () =>
      messages
        .filter((m) => m.orderId === orderId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [messages, orderId],
  );

  const handleSend = () => {
    const body = draft.trim();
    if (!body) return;
    sendMessage(orderId, senderId, body);
    setDraft("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <ChatThread
          messages={orderMessages}
          users={users}
          currentSenderId={senderId}
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
        />
      </CardContent>
    </Card>
  );
}
