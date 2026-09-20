import type { KaraokeNarrator } from "../../../src/index";

let activeNarrator: KaraokeNarrator | null = null;

export function claimSpeech(narrator: KaraokeNarrator): void {
  if (activeNarrator !== narrator) activeNarrator?.cancel();
  activeNarrator = narrator;
}

export function releaseSpeech(narrator: KaraokeNarrator | null): void {
  if (activeNarrator === narrator) activeNarrator = null;
}
