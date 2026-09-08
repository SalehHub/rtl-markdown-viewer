(function initializeShared(global) {
  "use strict";

  const STORAGE_KEY = "rtlMarkdownSettings";
  const DEFAULT_SETTINGS = Object.freeze({
    direction: "auto",
    theme: "system",
    fontSize: 18,
    padding: 48,
    margin: 48,
    borderRadius: 16
  });

  const DIRECTION_VALUES = new Set(["auto", "rtl", "ltr"]);
  const THEME_VALUES = new Set(["system", "light", "dark"]);

  const RTL_CHARACTER_PATTERN = /[\u0590-\u05ff\u0600-\u06ff\u0700-\u074f\u0750-\u077f\u0780-\u07bf\u08a0-\u08ff\ufb1d-\ufdff\ufe70-\ufefc]/gu;
  const LTR_CHARACTER_PATTERN = /[A-Za-z\u00c0-\u02af\u0370-\u058f]/gu;
  const RTL_STRONG_PATTERN = /[\u0590-\u05ff\u0600-\u06ff\u0700-\u074f\u0750-\u077f\u0780-\u07bf\u08a0-\u08ff\ufb1d-\ufdff\ufe70-\ufefc]/u;
  const LTR_STRONG_PATTERN = /[A-Za-z\u00c0-\u02af\u0370-\u058f]/u;

  function clamp(value, minimum, maximum) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return minimum;
    return Math.min(maximum, Math.max(minimum, numericValue));
  }

  function normalizeSettings(candidate) {
    const source = candidate && typeof candidate === "object" ? candidate : {};
    const legacyHorizontalMargin = source.horizontalMargin;
    const legacyVerticalMargin = source.verticalMargin;
    const legacySpacing =
      legacyHorizontalMargin === 0 && legacyVerticalMargin === 0
        ? 0
        : legacyHorizontalMargin ?? legacyVerticalMargin;

    return {
      direction: DIRECTION_VALUES.has(source.direction)
        ? source.direction
        : DEFAULT_SETTINGS.direction,
      theme: THEME_VALUES.has(source.theme)
        ? source.theme
        : DEFAULT_SETTINGS.theme,
      fontSize: clamp(source.fontSize ?? DEFAULT_SETTINGS.fontSize, 14, 28),
      padding: clamp(source.padding ?? legacySpacing ?? DEFAULT_SETTINGS.padding, 0, 160),
      margin: clamp(source.margin ?? legacySpacing ?? DEFAULT_SETTINGS.margin, 0, 160),
      borderRadius: clamp(
        source.borderRadius ?? DEFAULT_SETTINGS.borderRadius,
        0,
        48
      )
    };
  }

  function removeDirectionallyNoisyText(markdown) {
    return String(markdown ?? "")
      .replace(/^---\s*$[\s\S]*?^---\s*$/m, " ")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/~~~[\s\S]*?~~~/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/https?:\/\/\S+/gi, " ")
      .replace(/file:\/\/\S+/gi, " ");
  }

  function countMatches(text, pattern) {
    return Array.from(String(text ?? "").matchAll(pattern)).length;
  }

  function detectDocumentDirection(markdown) {
    const text = removeDirectionallyNoisyText(markdown);
    const rtlCount = countMatches(text, RTL_CHARACTER_PATTERN);
    const ltrCount = countMatches(text, LTR_CHARACTER_PATTERN);

    if (rtlCount === 0 && ltrCount === 0) return "ltr";

    // A modest threshold keeps Arabic reports RTL even when headings contain
    // English acronyms, URLs, or product names.
    return rtlCount / Math.max(1, rtlCount + ltrCount) >= 0.3 ? "rtl" : "ltr";
  }

  function detectTextDirection(text, fallback = "ltr") {
    const cleanText = String(text ?? "")
      .replace(/^\s*[\d\p{P}\p{S}]*/u, "")
      .trim();

    for (const character of cleanText) {
      if (RTL_STRONG_PATTERN.test(character)) return "rtl";
      if (LTR_STRONG_PATTERN.test(character)) return "ltr";
    }

    return fallback === "rtl" ? "rtl" : "ltr";
  }

  function resolveDocumentDirection(markdown, selectedDirection) {
    if (selectedDirection === "rtl" || selectedDirection === "ltr") {
      return selectedDirection;
    }

    return detectDocumentDirection(markdown);
  }

  global.RTLMarkdownShared = Object.freeze({
    STORAGE_KEY,
    DEFAULT_SETTINGS,
    normalizeSettings,
    detectDocumentDirection,
    detectTextDirection,
    resolveDocumentDirection
  });
})(globalThis);
