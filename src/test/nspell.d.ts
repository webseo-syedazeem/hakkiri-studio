declare module "nspell" {
  interface Speller {
    correct(word: string): boolean;
    suggest(word: string): string[];
    add(word: string): Speller;
  }
  export default function nspell(dictionary: { aff: Uint8Array | string; dic: Uint8Array | string }): Speller;
}
