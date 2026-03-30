"use client";

import { useEffect, useRef, useCallback } from "react";
import "@/app/styles/netflix-intro.css";

interface NetflixIntroProps {
  onComplete: () => void;
}

function FurElements() {
  return (
    <>
      {Array.from({ length: 31 }, (_, i) => (
        <span key={i} className={`fur-${31 - i}`} />
      ))}
    </>
  );
}

function LampElements() {
  return (
    <>
      {Array.from({ length: 28 }, (_, i) => (
        <span key={i} className={`lamp-${i + 1}`} />
      ))}
    </>
  );
}

function HelperBlock({
  num,
  hasLumieres = false,
}: {
  num: number;
  hasLumieres?: boolean;
}) {
  return (
    <div className={`helper-${num}`}>
      <div className="effect-brush">
        <FurElements />
      </div>
      {hasLumieres && (
        <div className="effect-lumieres">
          <LampElements />
        </div>
      )}
    </div>
  );
}

export default function NetflixIntro({ onComplete }: NetflixIntroProps) {
  const introRef = useRef<HTMLDivElement>(null);
  const hasCompletedRef = useRef(false);

  const startAnimation = useCallback(() => {
    const intro = introRef.current;
    if (!intro) return;

    const el = intro.querySelector("netflixintro") as HTMLElement | null;
    if (!el) return;

    const brushes = el.querySelectorAll(".effect-brush");
    const helpers = el.querySelectorAll('[class*="helper-"]');
    const lumieres = el.querySelectorAll(".effect-lumieres");
    const lamps = el.querySelectorAll('[class*="lamp-"]');

    el.classList.remove("playing");
    brushes.forEach((b) => b.classList.remove("playing"));
    helpers.forEach((h) => h.classList.remove("playing"));
    lumieres.forEach((l) => l.classList.remove("playing"));
    lamps.forEach((l) => l.classList.remove("playing"));

    // Force reflow
    void el.offsetWidth;

    el.classList.add("playing");
    brushes.forEach((b) => b.classList.add("playing"));
    helpers.forEach((h) => h.classList.add("playing"));
    lumieres.forEach((l) => l.classList.add("playing"));
    lamps.forEach((l) => l.classList.add("playing"));

    const handler = (e: AnimationEvent) => {
      if (e.animationName === "zoom-in") {
        el.removeEventListener("animationend", handler as EventListener);
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setTimeout(() => onComplete(), 300);
        }
      }
    };
    el.addEventListener("animationend", handler as EventListener);
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => startAnimation(), 200);
    return () => clearTimeout(timer);
  }, [startAnimation]);

  return (
    <div id="netflix-intro-container" ref={introRef}>
      {/* @ts-expect-error custom HTML element */}
      <netflixintro id="intro" letter="N">
        <HelperBlock num={1} hasLumieres />
        <HelperBlock num={2} />
        <HelperBlock num={3} />
        <HelperBlock num={4} />
      {/* @ts-expect-error custom HTML element */}
      </netflixintro>
    </div>
  );
}
