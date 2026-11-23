import { findBannedPhrases } from "./banned";
import type { Voice } from "../schema";

export interface VoiceMetrics {
  sentenceMean: number;
  sentenceSpread: number;
  contractionRate: number;
  firstPersonRate: number;
  score: number;
  bannedFound: string[];
}

export function measureVoice(text: string, voice?: Partial<Voice>): VoiceMetrics {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) {
    return {
      sentenceMean: 0,
      sentenceSpread: 0,
      contractionRate: 0,
      firstPersonRate: 0,
      score: 100,
      bannedFound: [],
    };
  }

  const lengths = sentences.map((s) => s.split(/\s+/).length);
  const totalWords = lengths.reduce((acc, len) => acc + len, 0);
  const sentenceMean = Math.round((totalWords / sentences.length) * 10) / 10;

  const variance = lengths.reduce((acc, len) => acc + Math.pow(len - sentenceMean, 2), 0) / sentences.length;
  const sentenceSpread = Math.round(Math.sqrt(variance) * 10) / 10;

  // Contraction check: isn't, didn't, we've, i've, don't, etc.
  const contractionMatches = text.match(/\b\w+['’](?:t|ve|re|ll|d|m|s)\b/gi) || [];
  const contractionRate = Math.round((contractionMatches.length / Math.max(totalWords, 1)) * 100);

  // First person check: I, me, my, we, our
  const firstPersonMatches = text.match(/\b(i|me|my|we|our|us)\b/gi) || [];
  const firstPersonRate = Math.round((firstPersonMatches.length / Math.max(totalWords, 1)) * 100);

  const bannedFound = findBannedPhrases(text, voice?.never || []);

  // Compute Voice Match Score (0 - 100)
  let score = 100;

  // Banned phrases penalty: -15 per banned word
  score -= bannedFound.length * 15;

  // Sentence length penalty if too long (> 24 words average) or robotic (< 8 words)
  if (sentenceMean > 24) score -= 15;
  if (sentenceMean < 8) score -= 10;

  // Target contractions based on preferences
  if (voice?.measured?.contractions && contractionRate === 0 && totalWords > 60) {
    score -= 10; // Expected friendly contractions
  }

  return {
    sentenceMean,
    sentenceSpread,
    contractionRate,
    firstPersonRate,
    score: Math.max(0, Math.min(100, score)),
    bannedFound,
  };
}
