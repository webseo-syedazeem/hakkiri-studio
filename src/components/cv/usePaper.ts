"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Flow } from "@/lib/cv/render/flow";
import { FONT_FILES, type FontKey } from "@/lib/cv/render/fonts";
import { type Fonts, type Layout, fontsNeeded, layoutCv } from "@/lib/cv/render/layout";
import { type PaperStyle, paperStyle } from "@/lib/cv/render/templates";
import { type Font, parseFont } from "@/lib/cv/render/ttf";
import type { CvDoc } from "@/lib/cv/schema";

/**
 * The paper preview's fonts and layout. The preview loads the very font files
 * the PDF embeds and lays the CV out with the same code the PDF writer uses,
 * so the page on screen and the downloaded page break in the same places.
 */

const loaded: Fonts = {};
const loading = new Map<FontKey, Promise<Font>>();

/** The name each font file is registered under in the browser. */
export const cssFamily = (key: FontKey) => `hakkiri-cv-${key}`;

function loadFont(key: FontKey): Promise<Font> {
  let p = loading.get(key);
  if (!p) {
    p = (async () => {
      const res = await fetch(`/api/cv/fonts/${FONT_FILES[key].file}`);
      if (!res.ok) throw new Error(`Font ${key} could not be loaded.`);
      const bytes = await res.arrayBuffer();
      const font = parseFont(new Uint8Array(bytes.slice(0)));
      const face = new FontFace(cssFamily(key), bytes);
      await face.load();
      document.fonts.add(face);
      loaded[key] = font;
      return font;
    })();
    p.catch(() => loading.delete(key));
    loading.set(key, p);
  }
  return p;
}

export interface Paper {
  layout: Layout;
  flow: Flow;
  style: PaperStyle;
  fonts: Fonts;
}

type Printable = Pick<CvDoc, "contact" | "sections" | "design" | "region" | "target">;

/**
 * The CV laid out on pages, kept up to date as it changes. While a newly
 * chosen template's fonts are loading, the last page stays up.
 */
export function usePaper(cv: Printable | null): { paper: Paper | null; state: "loading" | "ready" | "failed"; retry: () => void } {
  const design = cv?.design;
  const keys = useMemo(() => (design ? fontsNeeded(paperStyle(design)) : []), [design]);
  const [ready, setReady] = useState(0);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const last = useRef<Paper | null>(null);

  useEffect(() => {
    if (!keys.length) return;
    let live = true;
    setFailed(false);
    Promise.all(keys.map(loadFont)).then(
      () => live && setReady((n) => n + 1),
      () => live && setFailed(true),
    );
    return () => {
      live = false;
    };
  }, [keys, attempt]);

  const contact = cv?.contact;
  const sections = cv?.sections;
  const region = cv?.region;
  const target = cv?.target;
  const paper = useMemo(() => {
    if (!contact || !sections || !design || !region || !keys.every((k) => loaded[k])) return null;
    return { ...layoutCv({ contact, sections, design, region, target }, loaded), fonts: loaded };
    // `ready` changes when fonts arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact, sections, design, region, target, keys, ready]);
  if (paper) last.current = paper;

  return { paper: paper ?? last.current, state: paper ? "ready" : failed ? "failed" : "loading", retry: () => setAttempt((n) => n + 1) };
}
