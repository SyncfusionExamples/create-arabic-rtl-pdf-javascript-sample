# Arabic PDF Processing Samples using Syncfusion EJ2 PDF

This repository contains two end-to-end samples demonstrating Arabic and right-to-left (RTL) PDF workflows using:

- `@syncfusion/ej2-pdf`
- `@syncfusion/ej2-pdf-data-extract`

The samples cover PDF generation, Arabic text rendering, RTL text extraction, text searching, search result highlighting, PDF viewing, and PDF downloading across both web and .NET MAUI environments.

---

## Samples Included

### 1. .NET MAUI Blazor Hybrid (Android)

A .NET MAUI Blazor Hybrid application that hosts Syncfusion JavaScript PDF libraries inside a Blazor WebView.

#### Features

- Arabic RTL PDF generation
- TrueType font embedding (`PdfTrueTypeFont`)
- RTL text rendering using `PdfStringFormat`
- PDF text extraction
- Text search with bounding box information
- Search result highlighting
- Android PDF viewing through native intents
- PDF sharing fallback support

#### Key Technologies

- .NET 9 MAUI
- Blazor Hybrid
- Android
- JavaScript Interop
- `@syncfusion/ej2-pdf`
- `@syncfusion/ej2-pdf-data-extract`

#### Sample Location

```text
maui-blazor-hybrid/
```

#### Run

```bash
npm install
npm run build:js
dotnet build -t:Run -f net9.0-android
```

---

### 2. JavaScript Find Text Demo

A standalone JavaScript application demonstrating Arabic PDF processing entirely in the browser.

#### Features

- Arabic RTL PDF generation
- RTL-aware text extraction
- Text search with exact bounds
- Search result highlighting
- Embedded PDF viewing
- PDF downloading
- Responsive split-panel UI

#### Key Technologies

- JavaScript (ES Modules)
- Vite
- `@syncfusion/ej2-pdf`
- `@syncfusion/ej2-pdf-data-extract`

#### Sample Location

```text
javascript/find-text-demo/
```

#### Run

```bash
npm install
npm start
```

#### Build

```bash
npm run build
```

---

## Supported PDF Workflows

| Capability | MAUI Hybrid | JavaScript |
|------------|------------|------------|
| Arabic PDF Generation | ✅ | ✅ |
| RTL Text Rendering | ✅ | ✅ |
| TrueType Font Usage | ✅ | ✅ |
| Text Extraction | ✅ | ✅ |
| Text Search | ✅ | ✅ |
| Match Bounding Boxes | ✅ | ✅ |
| Search Result Highlighting | ✅ | ✅ |
| PDF Download | ✅ | ✅ |
| PDF Viewing | Android Viewer | Browser Viewer |

---

## How the Text Search Works

Text searching is performed using `PdfDataExtractor.findTextSync()` from `@syncfusion/ej2-pdf-data-extract`.

For every match, the API returns:

```text
pageNumber
x
y
width
height
```

These bounds can be used for:

- Highlighting search results
- Drawing annotations
- Navigation and selection workflows
- Search result visualization

---

## How Highlighting Works

Search matches are highlighted by drawing rectangles directly onto the PDF page using:

```ts
page.graphics.drawRectangle(...)
```

The highlighted PDF can then be:

- Saved
- Downloaded
- Displayed in a viewer
- Shared with users

---

## Font Requirements

Arabic text rendering requires a Unicode-compatible TrueType font.

The samples use **Noto Naskh Arabic**:

```text
https://cdn.syncfusion.com/content/pdf-resources/noto-naskh-arabic-regular.ttf
```

For offline scenarios, download the font and bundle it with the application.

---

## Prerequisites

### For .NET MAUI Sample

- .NET 9 SDK
- MAUI Android workload

```bash
dotnet workload install maui-android
```

- Android SDK
- Android Emulator or Device
- Node.js 18+

### For JavaScript Sample

- Node.js 18+
- npm

---

## Install Dependencies

Each sample contains its own `package.json`.

```bash
npm install
```

---

## Packages Used

### PDF Creation

```json
"@syncfusion/ej2-pdf"
```

### PDF Text Extraction and Search

```json
"@syncfusion/ej2-pdf-data-extract"
```

---

## Use Cases Demonstrated

- Arabic document generation
- RTL language support
- PDF text extraction
- Text search and indexing
- Search result highlighting
- Coordinates-based PDF content processing
- Browser PDF viewing
- Mobile PDF viewing
- JavaScript PDF workflows
- Hybrid MAUI + JavaScript integration

---

## License

Syncfusion EJ2 libraries are commercial products and may require a valid license for production use.

Refer to the repository licensing documentation and Syncfusion licensing terms for additional details.

---

## Related Packages

- `@syncfusion/ej2-pdf`
- `@syncfusion/ej2-pdf-data-extract`

---

## Screenshots

You can add screenshots demonstrating:

- Arabic PDF generation
- Extracted text results
- Find text results with bounding coordinates
- Highlighted search result PDF output
- Android PDF viewing experience
- Browser PDF viewing experience

to help users quickly understand the functionality demonstrated by both samples.