"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const createI18nMock = require("./i18n-mock.js");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const catalogs = Object.fromEntries(["en", "ar"].map((locale) => [
  locale, JSON.parse(read(`_locales/${locale}/messages.json`))
]));

async function openPopup(tabUrl, uiLocale = "en") {
  const elements = new Map();
  const writes = [];
  const reloads = [];
  let closed = false;
  const labels = [...read("popup/popup.html").matchAll(/data-i18n="([^"]+)"/g)]
    .map((match) => ({ dataset: { i18n: match[1] }, textContent: "" }));
  const context = vm.createContext({
    // Deliberately different from the UI locale: translation must use Chrome,
    // not the language of a web page or the user's content-language preference.
    navigator: { language: uiLocale.startsWith("ar") ? "en-US" : "ar-SA" },
    document: {
      documentElement: {},
      querySelectorAll: () => labels,
      getElementById(id) {
        if (!elements.has(id)) {
          const listeners = new Map();
          elements.set(id, {
            value: "",
            textContent: "",
            addEventListener: (event, handler) => listeners.set(event, handler),
            dispatch: (event) => listeners.get(event)()
          });
        }
        return elements.get(id);
      }
    },
    chrome: {
      i18n: createI18nMock(catalogs, uiLocale),
      storage: { sync: {
        async get(defaults) { return defaults; },
        async set(value) { writes.push(value); }
      } },
      tabs: {
        async query() { return tabUrl ? [{ id: 7, url: tabUrl }] : []; },
        async reload(id) { reloads.push(id); }
      }
    },
    window: { close() { closed = true; } }
  });
  vm.runInContext(read("src/shared.js"), context);
  vm.runInContext(read("src/i18n.js"), context);
  await vm.runInContext(read("popup/popup.js"), context);
  return {
    elements, writes, reloads, labels, root: context.document.documentElement,
    isClosed: () => closed, shared: context.RTLMarkdownShared
  };
}

test("popup chooses English or Arabic from Chrome's locale, including regional variants", async () => {
  for (const locale of ["en", "en-US", "en_GB", "ar", "ar-SA", "ar_EG", "fr", "he"]) {
    const expected = locale.startsWith("ar") ? catalogs.ar : catalogs.en;
    const popup = await openPopup("file:///sample/demo.md", locale);
    assert.equal(popup.root.lang, expected.uiLanguage.message);
    assert.equal(popup.root.dir, expected.uiDirection.message);
    for (const label of popup.labels) {
      assert.equal(label.textContent, expected[label.dataset.i18n].message);
    }
    assert.equal(popup.elements.get("status").textContent, expected.statusActive.message);
    // UI locale does not force a document writing-direction preference.
    assert.equal(popup.elements.get("direction").value, "auto");
    assert.equal(popup.writes.length, 0);
  }
});

test("popup translates active status for every supported Markdown suffix", async () => {
  for (const locale of ["en", "ar"]) {
    for (const extension of ["md", "markdown", "mdown", "mkd"]) {
      const { elements } = await openPopup(`file:///sample/demo.${extension}?preview=1`, locale);
      assert.equal(elements.get("status").textContent, catalogs[locale].statusActive.message);
    }
  }
});

test("popup translates setup instructions without a local Markdown tab", async () => {
  for (const locale of ["en", "ar"]) {
    for (const url of [undefined, "https://example.com/demo.md", "file:///sample/demo.txt"]) {
      const { elements } = await openPopup(url, locale);
      assert.equal(elements.get("status").textContent, catalogs[locale].statusInactive.message);
    }
  }
});

test("Arabic popup preserves preferences, zero spacing, and reset", async () => {
  const { elements, writes, shared, root } = await openPopup("file:///sample/demo.md", "ar");
  for (const [id, value, key] of [
    ["direction", "rtl", "direction"], ["theme", "dark", "theme"],
    ["font-size", "24", "fontSize"], ["padding", "0", "padding"],
    ["margin", "0", "margin"], ["border-radius", "0", "borderRadius"]
  ]) {
    elements.get(id).value = value;
    await elements.get(id).dispatch("change");
    assert.equal(String(writes.at(-1)[shared.STORAGE_KEY][key]), value);
    if (elements.has(`${id}-value`)) {
      assert.equal(elements.get(`${id}-value`).textContent, `${value}px`);
    }
  }
  await elements.get("reset").dispatch("click");
  assert.equal(JSON.stringify(writes.at(-1)[shared.STORAGE_KEY]), JSON.stringify(shared.DEFAULT_SETTINGS));
  assert.equal(elements.get("font-size-value").textContent, "18px");
  assert.equal(root.dir, "rtl");
  assert.equal(root.lang, "ar");
});

test("popup reload still targets the active tab", async () => {
  const popup = await openPopup("file:///sample/demo.md");
  await popup.elements.get("reload").dispatch("click");
  assert.deepEqual(popup.reloads, [7]);
  assert.equal(popup.isClosed(), true);
});

test("popup markup retains accessible labels and left-to-right numeric values", () => {
  const html = read("popup/popup.html");
  assert.match(html, /Markdown viewer with correct text direction/);
  assert.doesNotMatch(html, /class="bilingual"|id="status-ar"|id="status-en"/);
  for (const id of ["font-size", "padding", "margin", "border-radius"]) {
    assert.match(html, new RegExp(`<label for="${id}">`));
    assert.match(html, new RegExp(`id="${id}-value" dir="ltr"`));
  }
  assert.equal(JSON.parse(read("package.json")).version, JSON.parse(read("manifest.json")).version);
});

test("catalogs have complete matching keys and valid substitution placeholders", () => {
  assert.deepEqual(Object.keys(catalogs.en).sort(), Object.keys(catalogs.ar).sort());
  for (const [locale, catalog] of Object.entries(catalogs)) {
    for (const [key, entry] of Object.entries(catalog)) {
      assert.equal(typeof entry.message, "string", `${locale}.${key}`);
      assert.ok(entry.message.length > 0, `${locale}.${key}`);
      for (const [, placeholder] of entry.message.matchAll(/\$([a-z_]+)\$/gi)) {
        assert.ok(entry.placeholders?.[placeholder.toLowerCase()], `${locale}.${key}.${placeholder}`);
      }
    }
    assert.ok(catalog.extensionDescription.message.length <= 132);
  }
  for (const [, key] of read("src/content.js").matchAll(/\bt\("([^"]+)"/g)) {
    assert.ok(catalogs.en[key], `Missing toolbar message ${key}`);
  }
});

test("Chrome message substitutions preserve Arabic bidi isolation", () => {
  const i18n = createI18nMock(catalogs, "ar-SA");
  assert.equal(i18n.getMessage("fontValue", "18"), "الخط \u206618px\u2069");
  assert.equal(i18n.getMessage("stepDecrease", "حجم الخط"), "تقليل حجم الخط");
  assert.equal(i18n.getMessage("detectedDirection", "RTL"), "تلقائي: \u2066RTL\u2069");
});

test("native Chrome localization is loaded before the viewer and uses English fallback", () => {
  const manifest = JSON.parse(read("manifest.json"));
  assert.equal(manifest.default_locale, "en");
  for (const value of [manifest.name, manifest.description, manifest.action.default_title]) {
    const key = /^__MSG_(.+)__$/.exec(value)?.[1];
    assert.ok(key && catalogs.en[key]);
  }
  const scripts = manifest.content_scripts[0].js;
  assert.ok(scripts.indexOf("src/i18n.js") < scripts.indexOf("src/content.js"));
  assert.ok(scripts.includes("src/i18n.js"));
  const html = read("popup/popup.html");
  assert.ok(html.indexOf('src="../src/i18n.js"') < html.indexOf('src="popup.js"'));
});

test("plain HTML preview retains English fallback without Chrome extension APIs", async () => {
  const context = vm.createContext({
    document: { documentElement: {}, querySelectorAll: () => [] }
  });
  vm.runInContext(read("src/i18n.js"), context);
  await vm.runInContext(read("popup/popup.js"), context);
  assert.equal(context.document.documentElement.lang, "en");
  assert.equal(context.document.documentElement.dir, "ltr");
});
