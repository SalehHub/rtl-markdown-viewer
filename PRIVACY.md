# Privacy Policy for RTL Markdown Viewer

Effective date: September 8, 2026

RTL Markdown Viewer is a local-first Chrome extension for rendering local
Markdown files with correct right-to-left and left-to-right layout.

## Information the extension handles

### Local Markdown content

When the user opens a local Markdown file and grants Chrome permission to let
the extension access file URLs, the extension reads that file only to render it
in the current browser tab. The document content is processed locally in the
browser. The extension does not upload the Markdown source to the developer
or retain a separate copy after the tab is closed.

### Links and embedded media

If a document contains remote images or other media, Chrome may request those
resources from their original hosts when rendering the document. Those hosts
may receive normal request information such as the user's IP address and the
requested resource URL. Following external links opens the destination website,
whose own privacy policy applies. Use local media and avoid external links when
an entirely offline document is needed.

### Viewer preferences

The extension saves the user's selected writing direction, theme, font size,
padding, margin, and rounded-corner value using Chrome's `storage.sync` API.
Chrome may synchronize these preferences between browsers signed in to the same
Google account according to Google's own privacy practices. The developer does
not receive or have access to these preferences.

### Current tab information

When the user opens the extension popup, the extension checks whether the active
tab contains a local Markdown file. If the user selects **Reload file**, the
extension reloads that tab. The tab URL is not retained or transmitted.

## Data collection and sharing

The extension does not:

- operate a developer-controlled server;
- collect analytics or diagnostics;
- create user accounts;
- display advertising;
- sell user information; or
- transmit document content, browsing activity, or preferences to the developer.

Chrome preference synchronization and requests for document-embedded media are
described above. The extension has no analytics or advertising services.

## Permissions

- **File URL access** is used only to render local Markdown files. Chrome
  requires the user to enable this access explicitly.
- **Storage** is used only for viewer preferences.
- Chrome's Tabs API is used to identify and reload the current Markdown tab
  after the user opens the extension popup. Reloading a tab does not require a
  browsing-history permission, and the extension does not request one.

## Limited Use

Use of information received from Chrome APIs adheres to the Chrome Web Store
User Data Policy, including the Limited Use requirements.

## Changes to this policy

If the extension's data practices change, this policy will be updated before a
corresponding extension release is published.

## Contact

For privacy questions, email [rtl_markdown_viewer@sent.com](mailto:rtl_markdown_viewer@sent.com).
General bug reports can be submitted through the
[repository's Issues tab](https://github.com/SalehHub/rtl-markdown-viewer/issues).
Please do not include private documents or personal information in public issues.
