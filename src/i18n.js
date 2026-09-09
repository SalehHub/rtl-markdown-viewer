(function initializeTranslations() {
  "use strict";

  function text(key, substitutions) {
    return globalThis.chrome?.i18n?.getMessage(key, substitutions) || "";
  }

  // These catalog values describe the resolved translation, not the document
  // language. Unsupported Chrome languages inherit the English default locale.
  const language = text("uiLanguage") || "en";
  const direction = text("uiDirection") || "ltr";

  function localize(root) {
    for (const element of root.querySelectorAll("[data-i18n]")) {
      const message = text(element.dataset.i18n);
      if (message) element.textContent = message;
    }
  }

  globalThis.RTLMarkdownI18n = Object.freeze({ text, language, direction, localize });
})();
