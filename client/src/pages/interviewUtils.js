// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Goldman Sachs",
  "Atlassian",
  "Stripe",
  "Adobe",
  "Netflix",
  "Uber",
  "Flipkart",
  "Razorpay",
  "Swiggy",
  "Zomato",
  "Infosys",
  "TCS",
  "Wipro",
];
export const ROUNDS = ["DSA", "Technical", "HR", "System Design"];
export const PHASE = {
  SETUP: "setup",
  COUNTDOWN: "countdown",
  INTERVIEW: "interview",
  COMPLETE: "complete",
};
export const SESSION_KEY = "pp_video_interview";

// ─── TTS ──────────────────────────────────────────────────────────────────────
export async function speakText(text, onStart, onEnd) {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const speak = () => {
      const clean = text.replace(/[^\x00-\x7F]/g, "").trim();
      const utt = new SpeechSynthesisUtterance(clean);
      utt.lang = "en-US";
      utt.rate = 0.92;
      utt.pitch = 1;
      utt.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.name === "Google US English") ||
        voices.find(
          (v) => v.name === "Microsoft David - English (United States)",
        ) ||
        voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
        voices.find((v) => v.lang === "en-US") ||
        voices.find((v) => v.lang.startsWith("en"));
      if (preferred) utt.voice = preferred;
      utt.onstart = () => onStart?.();
      utt.onend = () => {
        onEnd?.();
        resolve();
      };
      utt.onerror = () => {
        onEnd?.();
        resolve();
      };
      window.speechSynthesis.speak(utt);
    };
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) speak();
    else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speak();
      };
    }
  });
}

// ─── FULLSCREEN ───────────────────────────────────────────────────────────────
export function enterFullscreen(el) {
  const target = el || document.documentElement;
  if (target.requestFullscreen) target.requestFullscreen().catch(() => {});
  else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
  else if (target.mozRequestFullScreen) target.mozRequestFullScreen();
}

export function exitFullscreen() {
  try {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    }
  } catch {}
}
