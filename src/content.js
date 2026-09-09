(async function initializeViewer() {
  "use strict";

  if (document.documentElement.dataset.rtlMarkdownViewer === "active") return;

  const shared = globalThis.RTLMarkdownShared;
  const i18n = globalThis.RTLMarkdownI18n;
  if (!shared || !i18n || !globalThis.marked || !globalThis.DOMPurify) return;
  const t = i18n.text;

  const decodedPath = decodeURIComponent(window.location.pathname || "");
  if (!/\.(md|markdown|mdown|mkd)$/i.test(decodedPath)) return;

  const markdownSource = readMarkdownSource();
  if (markdownSource === null) return;

  let settings = shared.normalizeSettings(
    (
      await chrome.storage.sync.get({
        [shared.STORAGE_KEY]: shared.DEFAULT_SETTINGS
      })
    )[shared.STORAGE_KEY]
  );

  let rawMode = false;
  let article;
  let renderedView;
  let rawView;
  let directionSelect;
  let themeSelect;
  let fontSizeValue;
  let paddingValue;
  let marginValue;
  let borderRadiusValue;
  let rawButton;
  let printButton;
  let directionStatus;

  renderApplication();
  applySettings();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" || !changes[shared.STORAGE_KEY]) return;
    settings = shared.normalizeSettings(changes[shared.STORAGE_KEY].newValue);
    applySettings();
  });

  document.addEventListener("keydown", (event) => {
    if (!event.altKey || !event.shiftKey) return;

    if (event.key.toLowerCase() === "r") {
      event.preventDefault();
      const modes = ["auto", "rtl", "ltr"];
      const nextMode = modes[(modes.indexOf(settings.direction) + 1) % modes.length];
      updateSettings({ direction: nextMode });
    }

    if (event.key.toLowerCase() === "m") {
      event.preventDefault();
      setRawMode(!rawMode);
    }
  });

  function readMarkdownSource() {
    const directPre = document.querySelector("body > pre");
    if (directPre) return directPre.textContent ?? "";

    const bodyChildren = Array.from(document.body?.children ?? []);
    if (bodyChildren.length <= 1) return document.body?.innerText ?? "";

    return null;
  }

  function renderApplication() {
    const parser = globalThis.marked;
    const unsafeHtml = parser.parse(markdownSource, {
      async: false,
      gfm: true,
      breaks: false
    });

    const safeHtml = globalThis.DOMPurify.sanitize(unsafeHtml, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
      FORBID_ATTR: ["style", "onerror", "onload"]
    });

    document.documentElement.dataset.rtlMarkdownViewer = "active";
    document.body.replaceChildren();

    const app = document.createElement("div");
    app.className = "rtlmd-app";

    const toolbar = buildToolbar();
    renderedView = document.createElement("main");
    renderedView.className = "rtlmd-rendered-view";

    article = document.createElement("article");
    article.className = "rtlmd-content";
    article.innerHTML = safeHtml;
    prepareRenderedContent(article);
    renderedView.appendChild(article);

    rawView = document.createElement("pre");
    rawView.className = "rtlmd-raw-view";
    rawView.dir = "ltr";
    rawView.textContent = markdownSource;
    rawView.hidden = true;

    app.append(toolbar, renderedView, rawView);
    document.body.appendChild(app);

    const firstHeading = article.querySelector("h1");
    const fallbackTitle = decodedPath.split("/").pop() || "Markdown";
    document.title = firstHeading?.textContent?.trim() || fallbackTitle;
  }

  function buildToolbar() {
    const toolbar = document.createElement("header");
    toolbar.className = "rtlmd-toolbar";
    toolbar.dir = i18n.direction;
    toolbar.lang = i18n.language;

    const brand = document.createElement("div");
    brand.className = "rtlmd-brand";
    brand.dir = "ltr";
    brand.textContent = "RTL Markdown";

    directionStatus = document.createElement("span");
    directionStatus.className = "rtlmd-direction-status";

    const spacer = document.createElement("div");
    spacer.className = "rtlmd-toolbar-spacer";

    directionSelect = buildSelect(
      t("writingDirection"),
      [
        ["auto", t("directionAuto")],
        ["rtl", t("directionRtl")],
        ["ltr", t("directionLtr")]
      ],
      (value) => updateSettings({ direction: value })
    );

    themeSelect = buildSelect(
      t("theme"),
      [
        ["system", t("themeSystem")],
        ["light", t("themeLight")],
        ["dark", t("themeDark")]
      ],
      (value) => updateSettings({ theme: value })
    );

    const fontGroup = buildStepper(
      t("fontSize"),
      () => updateSettings({ fontSize: settings.fontSize - 1 }),
      () => updateSettings({ fontSize: settings.fontSize + 1 })
    );
    fontSizeValue = fontGroup.querySelector("output");

    const paddingGroup = buildStepper(
      t("padding"),
      () => updateSettings({ padding: settings.padding - 8 }),
      () => updateSettings({ padding: settings.padding + 8 })
    );
    paddingValue = paddingGroup.querySelector("output");

    const marginGroup = buildStepper(
      t("margin"),
      () => updateSettings({ margin: settings.margin - 8 }),
      () => updateSettings({ margin: settings.margin + 8 })
    );
    marginValue = marginGroup.querySelector("output");

    const borderRadiusGroup = buildStepper(
      t("roundedCorners"),
      () => updateSettings({ borderRadius: settings.borderRadius - 2 }),
      () => updateSettings({ borderRadius: settings.borderRadius + 2 })
    );
    borderRadiusValue = borderRadiusGroup.querySelector("output");

    rawButton = buildButton(t("raw"), t("showRaw"), () => setRawMode(!rawMode));
    printButton = buildButton(t("print"), t("printHint"), () => window.print());

    toolbar.append(
      brand,
      directionStatus,
      spacer,
      directionSelect,
      themeSelect,
      fontGroup,
      paddingGroup,
      marginGroup,
      borderRadiusGroup,
      rawButton,
      printButton
    );

    return toolbar;
  }

  function buildSelect(label, options, onChange) {
    const select = document.createElement("select");
    select.className = "rtlmd-control rtlmd-select";
    select.setAttribute("aria-label", label);
    select.title = label;

    for (const [value, text] of options) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      select.appendChild(option);
    }

    select.addEventListener("change", () => onChange(select.value));
    return select;
  }

  function buildStepper(label, onDecrease, onIncrease) {
    const group = document.createElement("div");
    group.className = "rtlmd-stepper";
    group.setAttribute("aria-label", label);
    group.title = label;

    const decreaseButton = buildButton("−", t("stepDecrease", label), onDecrease);
    const value = document.createElement("output");
    value.className = "rtlmd-stepper-value";
    const increaseButton = buildButton("+", t("stepIncrease", label), onIncrease);

    group.append(decreaseButton, value, increaseButton);
    return group;
  }

  function buildButton(text, label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "rtlmd-control rtlmd-button";
    button.textContent = text;
    button.title = label;
    button.setAttribute("aria-label", label);
    button.addEventListener("click", onClick);
    return button;
  }

  function prepareRenderedContent(content) {
    addHeadingIds(content);
    highlightCode(content);
    wrapTables(content);

    for (const anchor of content.querySelectorAll("a")) {
      if (/^https?:/i.test(anchor.href)) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
    }
  }

  function addHeadingIds(content) {
    const usedIds = new Set();

    for (const heading of content.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
      if (heading.id) continue;

      const baseId = (heading.textContent || "section")
        .normalize("NFKC")
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-") || "section";

      let id = baseId;
      let suffix = 2;
      while (usedIds.has(id)) id = `${baseId}-${suffix++}`;
      usedIds.add(id);
      heading.id = id;
    }
  }

  function highlightCode(content) {
    if (!globalThis.hljs) return;

    for (const code of content.querySelectorAll("pre code")) {
      const languageClass = Array.from(code.classList).find((name) =>
        name.startsWith("language-")
      );
      const language = languageClass?.slice("language-".length);
      const source = code.textContent || "";

      try {
        const result =
          language && globalThis.hljs.getLanguage(language)
            ? globalThis.hljs.highlight(source, { language, ignoreIllegals: true })
            : globalThis.hljs.highlightAuto(source);
        code.innerHTML = result.value;
        code.classList.add("hljs");
      } catch {
        code.textContent = source;
      }
    }
  }

  function wrapTables(content) {
    for (const table of content.querySelectorAll("table")) {
      const wrapper = document.createElement("div");
      wrapper.className = "rtlmd-table-wrap";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  }

  function applySettings() {
    const documentDirection = shared.resolveDocumentDirection(
      markdownSource,
      settings.direction
    );

    document.documentElement.dataset.rtlmdTheme = settings.theme;
    document.documentElement.style.setProperty("--rtlmd-font-size", `${settings.fontSize}px`);
    document.documentElement.style.setProperty(
      "--rtlmd-page-padding",
      `${settings.padding}px`
    );
    document.documentElement.style.setProperty(
      "--rtlmd-page-margin",
      `${settings.margin}px`
    );
    document.documentElement.style.setProperty(
      "--rtlmd-radius",
      `${settings.borderRadius}px`
    );
    document.documentElement.dataset.rtlmdZeroMargin = String(settings.margin === 0);
    document.documentElement.lang = documentDirection === "rtl" ? "ar" : "en";

    article.dir = documentDirection;
    article.dataset.directionMode = settings.direction;
    applyBlockDirections(documentDirection);

    directionSelect.value = settings.direction;
    themeSelect.value = settings.theme;
    fontSizeValue.textContent = t("fontValue", String(settings.fontSize));
    paddingValue.textContent = t("paddingValue", String(settings.padding));
    marginValue.textContent = t("marginValue", String(settings.margin));
    borderRadiusValue.textContent = t("roundValue", String(settings.borderRadius));
    directionStatus.textContent =
      settings.direction === "auto"
        ? t("detectedDirection", documentDirection.toUpperCase())
        : documentDirection.toUpperCase();
  }

  function applyBlockDirections(documentDirection) {
    const blocks = article.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, li, dt, dd, figcaption, caption, th, td"
    );

    for (const block of blocks) {
      if (block.dataset.rtlmdOriginalDir === undefined) {
        block.dataset.rtlmdOriginalDir = block.getAttribute("dir") || "";
      }

      const originalDirection = block.dataset.rtlmdOriginalDir;
      if (settings.direction === "auto") {
        block.dir =
          originalDirection ||
          shared.detectTextDirection(block.textContent || "", documentDirection);
      } else {
        block.dir = documentDirection;
      }
    }

    for (const table of article.querySelectorAll("table")) {
      table.dir = documentDirection;
    }

    for (const code of article.querySelectorAll("pre, code, kbd, samp")) {
      code.dir = "ltr";
    }
  }

  function setRawMode(enabled) {
    rawMode = Boolean(enabled);
    renderedView.hidden = rawMode;
    rawView.hidden = !rawMode;
    rawButton.textContent = t(rawMode ? "preview" : "raw");
    rawButton.title = t(rawMode ? "showPreview" : "showRaw");
    rawButton.setAttribute("aria-label", rawButton.title);
    rawButton.setAttribute("aria-pressed", String(rawMode));
    printButton.disabled = rawMode;
    printButton.title = t(rawMode ? "printDisabled" : "printHint");
    printButton.setAttribute("aria-label", printButton.title);
  }

  async function updateSettings(partialSettings) {
    settings = shared.normalizeSettings({ ...settings, ...partialSettings });
    applySettings();
    await chrome.storage.sync.set({ [shared.STORAGE_KEY]: settings });
  }
})();
