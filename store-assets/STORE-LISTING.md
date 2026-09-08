# Chrome Web Store submission copy

Prepared for RTL Markdown Viewer 1.2.0 on September 8, 2026.

## Public project URLs

- Homepage: https://github.com/SalehHub/rtl-markdown-viewer
- Support: https://github.com/SalehHub/rtl-markdown-viewer/issues
- Privacy policy: https://github.com/SalehHub/rtl-markdown-viewer/blob/main/PRIVACY.md
- Public contact: rtl_markdown_viewer@sent.com

## Files to upload

- Extension package: `dist/rtl-markdown-viewer-1.2.0.zip`
- Store icon: `icons/icon-128.png`
- Screenshots: `store-assets/screenshot-light-rtl-1280x800.png` and
  `store-assets/screenshot-dark-rtl-1280x800.png`
- Required small promotional tile: `store-assets/promo-small-440x280.png`
- Optional marquee image: `store-assets/promo-marquee-1400x560.png`

## Store listing — English

### Product name

RTL Markdown Viewer

### Summary

Read local Markdown files with accurate Arabic, Hebrew, and mixed RTL/LTR rendering.

### Category

Productivity

### Detailed description

RTL Markdown Viewer turns local Markdown files into clean, readable pages with
reliable right-to-left and left-to-right layout.

Features:

- Automatically detects Arabic, Hebrew, and English document direction.
- Keeps individual mixed-language blocks readable.
- Places the first table column correctly on the right in RTL documents.
- Keeps code blocks, inline code, identifiers, and URLs left-to-right.
- Includes light, dark, and system themes.
- Adjusts font size, padding, margin, and rounded corners.
- Shows the original Markdown with the Raw button.
- Prints or saves the rendered document as PDF.
- Processes document content locally without analytics, advertising, or a
  developer-controlled server.

After installation, open the extension's Details page and enable **Allow access
to file URLs**. Then open or reload a local `.md`, `.markdown`, `.mdown`, or
`.mkd` file.

## Store listing — Arabic localization

### Product name

عارض Markdown للغات من اليمين إلى اليسار

### Summary

اعرض ملفات Markdown المحلية باتجاه صحيح للنصوص العربية والعبرية والمختلطة.

### Detailed description

يحوّل RTL Markdown Viewer ملفات Markdown المحلية إلى صفحات واضحة وسهلة
القراءة، مع دعم موثوق للكتابة من اليمين إلى اليسار ومن اليسار إلى اليمين.

المزايا:

- اكتشاف تلقائي لاتجاه المستندات العربية والعبرية والإنجليزية.
- تنسيق صحيح للفقرات التي تجمع بين أكثر من لغة.
- وضع العمود الأول في الجهة اليمنى داخل الجداول العربية.
- إبقاء الشفرة البرمجية والروابط والمعرّفات من اليسار إلى اليمين.
- مظاهر فاتحة وداكنة وتلقائية.
- التحكم في حجم الخط والحشو والهامش واستدارة الزوايا.
- عرض النص الأصلي عبر زر Raw.
- الطباعة أو الحفظ بصيغة PDF.
- معالجة محتوى المستند محليًا دون تحليلات أو إعلانات أو خادم تابع للمطور.

بعد التثبيت، افتح صفحة تفاصيل الإضافة وفعّل **السماح بالوصول إلى عناوين URL
للملفات**، ثم افتح ملف Markdown محليًا أو أعد تحميله.

## Privacy tab

### Single purpose

Render local Markdown files with correct RTL/LTR direction and adjustable reading layout.

### Permission justifications

**storage**

Stores the user's direction, theme, font size, padding, margin, and
rounded-corner preferences using Chrome storage sync.

**file:///* host access**

Required to render local Markdown files after the user explicitly enables
Allow access to file URLs in Chrome. File contents are processed locally and
are not transmitted.

The extension does not request the `tabs` or `activeTab` permission. Chrome's
Tabs API allows a tab to be reloaded without those permissions; access to a
matching local file URL comes from the narrowly scoped `file:///*` host access.

### Remote code

Select **No, I am not using remote code**. All executable libraries are included
inside the uploaded extension package.

### Data disclosure

Conservatively disclose local document content as **User-generated content** or
**Website content**, according to the categories displayed in the current
dashboard. State that it is processed locally for the user-facing rendering
feature, is not retained, and is not transmitted to the developer or third
parties.

Disclose that viewer preferences are stored through Chrome storage sync. The
developer does not receive these preferences.

Certify compliance with the Chrome Web Store User Data Policy and Limited Use
requirements.

### Privacy policy URL

Publish `PRIVACY.md` at a stable, publicly accessible HTTPS URL and enter that
URL in the dashboard. A public GitHub repository page or GitHub Pages site can
host it.

## Test instructions

1. Install the submitted package.
2. Open the extension's Details page in `chrome://extensions`.
3. Enable **Allow access to file URLs**.
4. Download `sample/arabic-sample.md` from the public repository, or create a
   local `.md` file containing Arabic text and a Markdown table.
5. Reload the file if necessary.
6. Confirm that the toolbar reports **Detected RTL**, Arabic is right-aligned,
   the first table column is on the right, and code remains left-to-right.
7. Change Direction, Theme, Font, Padding, Margin, and Round values and confirm
   that the preview updates.
8. Confirm that Raw displays the original Markdown and Print opens Chrome's
   print dialog.

No account, credentials, network connection, payment, or external service is
required.

## Distribution

For the first release, **Unlisted** is a practical choice if the extension is
for colleagues or students who will receive its direct URL. Choose **Public**
if it should appear in Chrome Web Store searches. Both options undergo review.

## Items the publisher must supply

- Chrome Web Store developer account and registration payment.
- Publisher name and verified developer email.
- Public HTTPS URL for `PRIVACY.md`.
- Optional support and homepage URLs.
- Final choice of Public or Unlisted distribution and countries.
- Agreement to the declarations shown by Google, followed by Submit for Review.
