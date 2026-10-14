/** Helpers for the assistant's spoken replies (browser speechSynthesis). */

/** Higher = more natural. Browsers expose neural voices under these names. */
export function voiceScore(v: SpeechSynthesisVoice): number {
  let s = 0;
  const n = v.name.toLowerCase();
  if (/natural|neural|online/.test(n)) s += 50; // Microsoft Edge "… Online (Natural)"
  if (/enhanced|premium|siri/.test(n)) s += 45; // Apple
  if (/^google/.test(n)) s += 30; // Chrome
  if (/compact|novelty|whisper|bad|good|bells|boing|cellos|organ|trinoids|zarvox/.test(n)) s -= 60;
  if (v.lang === "en-IN") s += 25;
  else if (v.lang.startsWith("en-GB")) s += 15;
  else if (v.lang.startsWith("en")) s += 10;
  else s -= 100;
  if (!v.localService) s += 5;
  return s;
}

export function englishVoices(): SpeechSynthesisVoice[] {
  const all = window.speechSynthesis?.getVoices() ?? [];
  return all.filter((v) => v.lang.startsWith("en")).sort((a, b) => voiceScore(b) - voiceScore(a));
}

/** Make written text sound right when read aloud. */
export function cleanForSpeech(input: string): string {
  let t = input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // markdown links
    .replace(/https?:\/\/\S+/g, "the course page link")
    .replace(/[*_`#>~|]+/g, " ")
    .replace(/^\s*[-•·▪●]\s+/gm, "") // bullets
    .replace(/\s*[-–—]\s*/g, (m) => (m.includes("\n") ? m : ", "));

  t = t
    .replace(/(?:₹|Rs\.?|INR)\s?([\d,.]+)\s?(LPA|lpa)/g, "$1 lakh per annum")
    .replace(/([\d,.]+)\s?(LPA|lpa)/g, "$1 lakh per annum")
    .replace(/(?:₹|Rs\.?|INR)\s?([\d,.]+)\s?(?:L|lakhs?)\b/gi, "$1 lakh rupees")
    .replace(/(?:₹|Rs\.?|INR)\s?([\d,.]+)\s?(?:Cr|crores?)\b/gi, "$1 crore rupees")
    .replace(/(?:₹|Rs\.?|INR)\s?([\d,]+(?:\.\d+)?)/g, "$1 rupees")
    .replace(/(\d)\s?%/g, "$1 percent")
    .replace(/\bB\.?Tech\b/gi, "B Tech")
    .replace(/\bGenAI\b/g, "Gen A I")
    .replace(/\bAI\b/g, "A I")
    .replace(/\bML\b/g, "M L")
    .replace(/\bIIT\b/g, "I I T")
    .replace(/&/g, " and ")
    .replace(/\s{2,}/g, " ");
  return t.trim();
}
