# Arabic PDF generation – .NET MAUI Blazor Hybrid (Android) + `@syncfusion/ej2-pdf`

A .NET MAUI Blazor Hybrid app that creates an Arabic, right-to-left PDF with the JavaScript package
[`@syncfusion/ej2-pdf`](https://www.npmjs.com/package/@syncfusion/ej2-pdf) running inside the Blazor WebView.

## How it works

1. `js/pdf-generator.js` imports `PdfDocument`, `PdfPageSettings`, `PdfMargins`, `PdfBrush`, `PdfStringFormat`,
   `PdfTextDirection`, `PdfTextAlignment` and `PdfTrueTypeFont` from `@syncfusion/ej2-pdf`.
2. The Noto Naskh Arabic TTF is downloaded with `fetch` from
   `https://cdn.syncfusion.com/content/pdf-resources/noto-naskh-arabic-regular.ttf` (cached after first load) and
   turned into a `Uint8Array`.
3. A `PdfTrueTypeFont` is created from those bytes and the text is drawn with a `PdfStringFormat` using
   `PdfTextDirection.rightToLeft` and `PdfTextAlignment.right`.
4. The PDF bytes are returned to Blazor as a base64 string through JS interop (`generateArabicPdf`).
5. `Services/PdfService.cs` decodes them, saves `ArabicSample.pdf` in `FileSystem.Current.AppDataDirectory`, and opens it
   with an `ACTION_VIEW` intent through a `FileProvider` (falls back to the share sheet if no viewer is installed).
6. `Components/Pages/PdfGenerator.razor` provides the UI: editable Arabic text and a **Generate PDF** button (which saves the PDF and opens it in the Android viewer).

## Project layout

| Path | Purpose |
| --- | --- |
| `js/pdf-generator.js` | Source module using EJ2 PDF |
| `wwwroot/js/pdf-generator.js` | esbuild bundle (generated, git-ignored) |
| `Services/PdfService.cs` | JS interop, save, open, share |
| `Components/Pages/PdfGenerator.razor` | Blazor UI |
| `Platforms/Android/` | Manifest (INTERNET permission, FileProvider, PDF `queries`) and `file_paths.xml` |

## Prerequisites

- .NET 9 SDK with the MAUI workload: `dotnet workload install maui-android`
- Android SDK + an emulator (API 21+)
- Node.js 18+ (to bundle the JS)
- Internet access on the emulator/device (to download the font)

## Build and run

```bash
npm install
npm run build:js          # bundles @syncfusion/ej2-pdf into wwwroot/js/pdf-generator.js
dotnet build -t:Run -f net9.0-android
```

The csproj also runs the npm steps automatically if the bundle is missing. Re-run `npm run build:js` after editing
`js/pdf-generator.js`.

## Notes

- `@syncfusion/ej2-pdf` is a Syncfusion commercial package; a license may be required for production use.
- The font is fetched at runtime; for offline use, add the TTF to `wwwroot/` and change `arabicFontUrl` to a relative path.
