(async function initializePopup() {
  "use strict";

  const shared = globalThis.RTLMarkdownShared;
  const i18n = globalThis.RTLMarkdownI18n;
  i18n.localize(document);
  document.documentElement.lang = i18n.language;
  document.documentElement.dir = i18n.direction;

  // A plain file preview has no extension APIs; keep its English HTML fallback.
  if (!globalThis.chrome?.storage?.sync || !globalThis.chrome?.tabs) return;
  const direction = document.getElementById("direction");
  const theme = document.getElementById("theme");
  const fontSize = document.getElementById("font-size");
  const fontSizeValue = document.getElementById("font-size-value");
  const padding = document.getElementById("padding");
  const paddingValue = document.getElementById("padding-value");
  const margin = document.getElementById("margin");
  const marginValue = document.getElementById("margin-value");
  const borderRadius = document.getElementById("border-radius");
  const borderRadiusValue = document.getElementById("border-radius-value");
  const reloadButton = document.getElementById("reload");
  const resetButton = document.getElementById("reset");
  const status = document.getElementById("status");

  let settings = shared.normalizeSettings(
    (
      await chrome.storage.sync.get({
        [shared.STORAGE_KEY]: shared.DEFAULT_SETTINGS
      })
    )[shared.STORAGE_KEY]
  );

  render();
  updateTabStatus();

  direction.addEventListener("change", () => save({ direction: direction.value }));
  theme.addEventListener("change", () => save({ theme: theme.value }));
  fontSize.addEventListener("input", () => {
    fontSizeValue.textContent = `${fontSize.value}px`;
  });
  fontSize.addEventListener("change", () => save({ fontSize: Number(fontSize.value) }));
  padding.addEventListener("input", () => {
    paddingValue.textContent = `${padding.value}px`;
  });
  padding.addEventListener("change", () => save({ padding: Number(padding.value) }));
  margin.addEventListener("input", () => {
    marginValue.textContent = `${margin.value}px`;
  });
  margin.addEventListener("change", () => save({ margin: Number(margin.value) }));
  borderRadius.addEventListener("input", () => {
    borderRadiusValue.textContent = `${borderRadius.value}px`;
  });
  borderRadius.addEventListener("change", () =>
    save({ borderRadius: Number(borderRadius.value) })
  );

  resetButton.addEventListener("click", async () => {
    settings = { ...shared.DEFAULT_SETTINGS };
    await chrome.storage.sync.set({ [shared.STORAGE_KEY]: settings });
    render();
  });

  reloadButton.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id !== undefined) await chrome.tabs.reload(tab.id);
    window.close();
  });

  function render() {
    direction.value = settings.direction;
    theme.value = settings.theme;
    fontSize.value = String(settings.fontSize);
    fontSizeValue.textContent = `${settings.fontSize}px`;
    padding.value = String(settings.padding);
    paddingValue.textContent = `${settings.padding}px`;
    margin.value = String(settings.margin);
    marginValue.textContent = `${settings.margin}px`;
    borderRadius.value = String(settings.borderRadius);
    borderRadiusValue.textContent = `${settings.borderRadius}px`;
  }

  async function save(partialSettings) {
    settings = shared.normalizeSettings({ ...settings, ...partialSettings });
    await chrome.storage.sync.set({ [shared.STORAGE_KEY]: settings });
    render();
  }

  async function updateTabStatus() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isMarkdownFile = /^file:.*\.(md|markdown|mdown|mkd)(?:[#?].*)?$/i.test(
      tab?.url || ""
    );

    status.textContent = i18n.text(isMarkdownFile ? "statusActive" : "statusInactive");
  }
})();
