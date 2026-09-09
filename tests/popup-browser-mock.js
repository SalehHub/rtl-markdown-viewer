// Local visual preview only. This file is not included in the extension ZIP.
"use strict";

globalThis.chrome = {
  i18n: globalThis.createI18nMock(
    globalThis.RTLMarkdownPreviewCatalogs,
    new URLSearchParams(location.search).get("lang") || "en"
  ),
  storage: { sync: {
    async get(defaults) { return defaults; },
    async set() {}
  }, onChanged: { addListener() {} } },
  tabs: {
    async query() {
      return [{
        id: 1,
        url: new URLSearchParams(location.search).has("active")
          ? "file:///sample/arabic-sample.md"
          : "https://example.com/"
      }];
    },
    async reload() {}
  }
};
