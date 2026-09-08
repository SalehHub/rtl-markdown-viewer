"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

require("../src/shared.js");

const {
  DEFAULT_SETTINGS,
  normalizeSettings,
  detectDocumentDirection,
  detectTextDirection,
  resolveDocumentDirection
} = globalThis.RTLMarkdownShared;

test("detects an Arabic document as RTL", () => {
  const markdown = `
# دليل العرض العربي

| الخاصية | الوصف |
| --- | --- |
| اتجاه النص | تلقائي |
| المظهر | قابل للتخصيص |
`;

  assert.equal(detectDocumentDirection(markdown), "rtl");
});

test("detects an English document as LTR", () => {
  assert.equal(
    detectDocumentDirection("# Training report\n\nThis document is written in English."),
    "ltr"
  );
});

test("ignores fenced code and URLs during document detection", () => {
  const markdown = `
# تقرير عربي

هذا تقرير مكتوب باللغة العربية ويحتوي على نتائج واضحة.

\`\`\`javascript
const longEnglishVariableName = "https://example.com/english/path";
\`\`\`
`;

  assert.equal(detectDocumentDirection(markdown), "rtl");
});

test("detects block direction from the first strong character", () => {
  assert.equal(detectTextDirection("123 — دليل العرض", "ltr"), "rtl");
  assert.equal(detectTextDirection("123 — Display guide", "rtl"), "ltr");
  assert.equal(detectTextDirection("12345", "rtl"), "rtl");
});

test("explicit direction overrides automatic detection", () => {
  assert.equal(resolveDocumentDirection("نص عربي", "ltr"), "ltr");
  assert.equal(resolveDocumentDirection("English text", "rtl"), "rtl");
});

test("normalizes unsafe or invalid settings", () => {
  assert.deepEqual(normalizeSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(normalizeSettings({ direction: "sideways", fontSize: 200 }), {
    ...DEFAULT_SETTINGS,
    fontSize: 28
  });
  assert.equal(normalizeSettings({ padding: -8 }).padding, 0);
  assert.equal(normalizeSettings({ margin: 500 }).margin, 160);
  assert.equal(normalizeSettings({ borderRadius: 100 }).borderRadius, 48);
});

test("migrates legacy margin settings", () => {
  assert.deepEqual(
    normalizeSettings({ horizontalMargin: 32, verticalMargin: 64 }),
    { ...DEFAULT_SETTINGS, padding: 32, margin: 32 }
  );
  assert.deepEqual(
    normalizeSettings({ horizontalMargin: 0, verticalMargin: 0 }),
    { ...DEFAULT_SETTINGS, padding: 0, margin: 0 }
  );
});
