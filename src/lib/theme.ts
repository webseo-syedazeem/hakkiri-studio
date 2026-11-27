/**
 * The workspace appearance, kept in this browser under `hk_theme`. The app
 * opens dark; light is a choice the person makes (on first sign-in, or under
 * Appearance). Browser only.
 */

export type Appearance = "dark" | "light";

export const THEME_KEY = "hk_theme";

/** Applies an appearance to the page at once. */
export function applyAppearance(theme: Appearance): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("mk");
  } else {
    root.classList.remove("dark");
    root.classList.add("mk");
  }
  root.dataset.theme = theme;
  // The Appearance control in the rail follows a change made anywhere else.
  window.dispatchEvent(new CustomEvent("hk_theme_changed", { detail: theme }));
}

/** The saved appearance, or null when the person hasn't chosen one (or storage can't be read). */
export function savedAppearance(): Appearance | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

/** Saves the appearance. Returns false when this browser wouldn't keep it. */
export function saveAppearance(theme: Appearance): boolean {
  try {
    localStorage.setItem(THEME_KEY, theme);
    return localStorage.getItem(THEME_KEY) === theme;
  } catch {
    return false;
  }
}
