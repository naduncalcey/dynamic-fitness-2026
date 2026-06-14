"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLabels } from "@/lib/i18n/LabelsProvider";

/**
 * Site-wide background music toggle. Rendered once in the root layout so the
 * track keeps playing across client-side navigations. Sits just above the
 * back-to-top button (bottom-right) in the same glassmorphism style.
 *
 * Starts muted/paused on purpose: browsers block autoplay of audio with sound,
 * so showing a "playing" icon with no sound would look broken. Instead the
 * control shows the muted state up front and the visitor opts in by clicking.
 * The button reflects the actual audio state via its play/pause events.
 */

// Web-optimized AAC (~1.3 MB, 96 kbps) — re-encoded from the 3.4 MB/256 kbps
// source. AAC/.m4a is supported across all current browsers.
const SRC = "/audio/bg-music.m4a";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  // Muted/paused until the visitor clicks; synced to the audio's play/pause events.
  const [playing, setPlaying] = useState(false);
  const t = useLabels();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  return (
    <>
      {/* preload="none": the file loads only when the visitor starts it. */}
      <audio ref={audioRef} src={SRC} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? t("a11y.muteMusic") : t("a11y.playMusic")}
        aria-pressed={playing}
        className="group fixed bottom-24 right-6 z-30 grid size-14 place-items-center rounded-full border border-white/15 bg-[var(--cta-surface)] text-white/70 backdrop-blur-md transition-all duration-300 hover:border-[var(--cta-red-border)] hover:text-white"
      >
        {playing ? (
          <Volume2 className="size-5" strokeWidth={1.5} aria-hidden />
        ) : (
          <VolumeX className="size-5" strokeWidth={1.5} aria-hidden />
        )}
      </button>
    </>
  );
}

export default BackgroundMusic;
