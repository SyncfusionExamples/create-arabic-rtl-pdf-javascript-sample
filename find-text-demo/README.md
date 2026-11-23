# JavaScript PDF Find Text Demo (Arabic / RTL)

Standalone JavaScript sample demonstrating Arabic PDF text rendering, RTL text extraction, text searching, drawing highlight rectangles over search matches, and displaying the result in-browser using only:
- `@syncfusion/ej2-pdf`
- `@syncfusion/ej2-pdf-data-extract`

## Features

- **Arabic RTL PDF Generation**: Creates PDF documents with Arabic text using `PdfTrueTypeFont` and `PdfStringFormat` configured for right-to-left text direction.
- **RTL Text Extraction**: Extracts text from PDF documents using `PdfDataExtractor` while preserving RTL reading order.
- **Text Search**: Locates occurrences of Arabic, English, or mixed-content words across all pages (with optional case-sensitive and whole-word matching) and returns exact bounding box coordinates.
- **Search Result Highlighting**: Draws red highlight rectangles over matched text bounds using `PdfGraphics.drawRectangle()`.
- **In-Browser Viewer**: Renders the loaded or highlighted PDF in a side-by-side view with built-in toolbar hidden.
- **PDF Download**: Automatically downloads generated Arabic PDFs and allows downloading highlighted search result PDFs.

## Architecture & Layout

The application uses a 50/50 split layout:
- **Left Panel**: All controls, search inputs, options, action buttons, and a results text area that displays extracted text, match counts, and bounding box coordinates (`{ x, y, width, height }`).
- **Right Panel**: Embedded PDF viewer showing the active PDF document with highlighted search results.

```text
javascript/find-text-demo/
│
├── index.html          # Split-panel application layout
├── app.js              # UI interaction and event wiring
├── styles.css          # Responsive 50/50 layout styles
├── pdf-generator.js    # Pure PDF logic (generate, extract, find, highlight)
├── package.json        # Dependencies and Vite scripts
└── assets/
    └── sample.pdf      # Sample Arabic PDF document
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation & Running

1. Navigate to the project directory:
   ```bash
   cd javascript/find-text-demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

   The application will open automatically in your default browser at `http://localhost:5173`.

> **Note**: Because this project uses ES modules and npm dependencies, it must be run via the development server (`npm start`). Opening `index.html` directly via `file://` will not work.

### Building for Production

To build optimized assets:

```bash
npm run build
```

## How It Works

1. **Initial Load**: On startup, `app.js` fetches `assets/sample.pdf` and displays it in the viewer.
2. **Generate PDF**: Clicking **Generate PDF** creates a new document with Arabic RTL text rendered with the Noto Naskh Arabic font from the Syncfusion CDN, and automatically downloads `arabic.pdf`.
3. **Extract Text**: Clicking **Extract Text** uses `PdfDataExtractor.extractTextLinesSync()` to extract text while maintaining RTL order and outputs it to the results area.
4. **Find text and highlight search results**: Searches for the term using `PdfDataExtractor.findTextSync()`. When matches are found:
   - Match count and bounds (`pageIndex`, `x`, `y`, `width`, `height`) are printed to the results area.
   - Red highlight rectangles are drawn on the PDF canvas using `PdfGraphics.drawRectangle()`.
   - The highlighted PDF is loaded into the viewer.
5. **Download PDF**: Downloads the currently viewed PDF (`sample-highlighted.pdf` when highlighted).

## License

Syncfusion EJ2 components and libraries are commercial products requiring a license. Refer to the repository root [README.md](../../README.md) for licensing details.
