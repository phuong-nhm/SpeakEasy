"use client";

import { useState } from "react";
import { ChatBubbleButton } from "./ChatBubbleButton";
import { ChatPanel } from "./ChatPanel";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <ChatPanel />}
      <ChatBubbleButton open={open} onClick={() => setOpen((v) => !v)} />
    </>
  );
}
