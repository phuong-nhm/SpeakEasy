"use client";

interface ChatBubbleButtonProps {
  open: boolean;
  onClick: () => void;
}

export function ChatBubbleButton({ open, onClick }: ChatBubbleButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Đóng trợ lý học tập" : "Mở trợ lý học tập"}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B3A4B] text-[#F2C879] shadow-lg shadow-[#1B3A4B]/30 transition-transform hover:scale-105 active:scale-95"
    >
      {open ? (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.2 0-2.34-.26-3.36-.73L3 20l1.1-4.03A8.5 8.5 0 1 1 21 11.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
