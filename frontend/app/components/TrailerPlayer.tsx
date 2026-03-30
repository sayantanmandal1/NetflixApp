"use client";

import { useState, useCallback } from "react";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";

interface TrailerPlayerProps {
  videoKey: string | null;
  autoplay?: boolean;
  muted?: boolean;
  className?: string;
  onEnd?: () => void;
}

export default function TrailerPlayer({
  videoKey,
  autoplay = true,
  muted = true,
  className = "",
  onEnd,
}: TrailerPlayerProps) {
  const [isMuted, setIsMuted] = useState(muted);
  const [player, setPlayer] = useState<ReturnType<YouTubeEvent["target"]["getIframe"]> | null>(null);

  const onReady = useCallback(
    (event: YouTubeEvent) => {
      setPlayer(event.target);
      if (muted) {
        event.target.mute();
      }
      if (autoplay) {
        event.target.playVideo();
      }
    },
    [autoplay, muted]
  );

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
        player.setVolume(100);
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  if (!videoKey) return null;

  const opts: YouTubeProps["opts"] = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: autoplay ? 1 : 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      mute: muted ? 1 : 0,
      loop: 0,
      playsinline: 1,
      iv_load_policy: 3,
      disablekb: 1,
    },
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: "absolute", top: "-60px", bottom: "-60px", left: "-60px", right: "-60px" }}>
          <YouTube
            videoId={videoKey}
            opts={opts}
            onReady={onReady}
            onEnd={() => onEnd?.()}
            className="w-full h-full"
            iframeClassName="w-full h-full"
          />
        </div>
      </div>

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="absolute bottom-8 right-14 z-10 w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:border-white transition-colors bg-black/30"
      >
        {isMuted ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>
    </div>
  );
}
