// Chrome locale lookup semantics for unit tests and local visual previews only.
(function exposeI18nMock() {
  "use strict";

  function createI18nMock(catalogs, uiLocale = "en") {
    const locale = uiLocale.replaceAll("-", "_");
    const language = locale.split("_")[0];
    return {
      getUILanguage: () => uiLocale,
      getMessage(key, substitutions = []) {
        const entry = catalogs[locale]?.[key] || catalogs[language]?.[key] || catalogs.en[key];
        if (!entry) return "";
        const values = Array.isArray(substitutions) ? substitutions : [substitutions];
        return entry.message.replace(/\$([a-z_]+)\$/gi, (_, name) =>
          (entry.placeholders?.[name.toLowerCase()]?.content || "")
            .replace(/\$(\d)/g, (_, index) => values[Number(index) - 1] ?? "")
        );
      }
    };
  }

  if (typeof module !== "undefined") module.exports = createI18nMock;
  else globalThis.createI18nMock = createI18nMock;
})();
