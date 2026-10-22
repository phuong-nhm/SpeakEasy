"use client";

import { useRef, useState } from "react";

interface AudioPlayButtonProps {
  audioUrl?: string | null;
}

export function AudioPlayButton({ audioUrl }: AudioPlayButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!audioUrl) return null;

  const handleClick = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-white text-indigo-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50 disabled:cursor-not-allowed"
      aria-label="Nghe câu"
    >
      {isPlaying ? "🔊" : "🔈"}
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </button>
  );
}
