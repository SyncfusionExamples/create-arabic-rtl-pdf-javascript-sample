import {
    PdfDocument,
    PdfPageSettings,
    PdfMargins,
    PdfBrush,
    PdfStringFormat,
    PdfTextDirection,
    PdfTextAlignment,
    PdfTrueTypeFont,
    PdfPen
} from '@syncfusion/ej2-pdf';
import { PdfDataExtractor } from '@syncfusion/ej2-pdf-data-extract';

const arabicFontUrl =
    'https://cdn.syncfusion.com/content/pdf-resources/noto-naskh-arabic-regular.ttf';

// Embedded in wwwroot/pdf and served from the app package (relative to the WebView base href)
const pdfUrl = 'https://document.syncfusion.com/content/pdf-resources/ArbicText.pdf';

const defaultArabicText =
`سنبدأ بنظرة عامة مفاهيمية على مستند PDF بسيط. تم تصميم هذا الفصل ليكون توجيهًا مختصرًا قبل الغوص في مستند حقيقي وإنشاءه من البداية.
يمكن تقسيم ملف PDF إلى أربعة أجزاء: الرأس والجسم والجدول الإسناد الترافقي والمقطورة. يضع الرأس الملف كملف PDF ، حيث يحدد النص المستند المرئي ، ويسرد جدول الإسناد الترافقي موقع كل شيء في الملف ، ويوفر المقطع الدعائي تعليمات حول كيفية بدء قراءة الملف.
رأس الصفحة هو ببساطة رقم إصدار PDF وتسلسل عشوائي للبيانات الثنائية. البيانات الثنائية تمنع التطبيقات الساذجة من معالجة ملف PDF كملف نصي. سيؤدي ذلك إلى ملف تالف ، لأن ملف PDF يتكون عادةً من نص عادي وبيانات ثنائية (على سبيل المثال ، يمكن تضمين ملف خط ثنائي بشكل مباشر في ملف PDF).`;

const defaultSearchText = 'ملف';

const highlightColors = [
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 0, b: 255 },
    { r: 0, g: 128, b: 0 },
    { r: 255, g: 140, b: 0 },
    { r: 128, g: 0, b: 128 }
];

let cachedFontBytes = null;
let cachedPdfBytes = null;

async function fetchAsUint8Array(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download resource (${response.status} ${response.statusText}): ${url}`);
    }
    return new Uint8Array(await response.arrayBuffer());
}

function toBase64(bytes) {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
}

/**
 * Generates an Arabic RTL PDF and returns it as a base64 string
 * (base64 is the most reliable way to move binary data through Blazor JS interop).
 * @param {string} [text] Arabic text to draw; defaults to the sample paragraph.
 * @param {number} [fontSize]
 */
export async function generateArabicPdf(text, fontSize) {
    if (!cachedFontBytes) {
        cachedFontBytes = await fetchAsUint8Array(arabicFontUrl);
    }

    const pdf = new PdfDocument();
    try {
        const pageSettings = new PdfPageSettings({ margins: new PdfMargins(40) });
        const page = pdf.addPage(pageSettings);
        const g = page.graphics;

        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const clientBounds = g.clientSize;
        const rect = { x: 0, y: 0, width: clientBounds.width, height: clientBounds.height };

        const format = new PdfStringFormat();
        format.textDirection = PdfTextDirection.rightToLeft;
        format.alignment = PdfTextAlignment.right;

        const arabicFont = new PdfTrueTypeFont(cachedFontBytes, fontSize || 13);
        g.drawString(text && text.trim() ? text : defaultArabicText, arabicFont, rect, brush, format);

        const pdfBytes = await pdf.save();
        return toBase64(pdfBytes);
    } finally {
        pdf.destroy();
    }
}

export function getDefaultArabicText() {
    return defaultArabicText;
}

/**
 * Extracts the text lines of page 0 from the sample Arabic PDF.
 * The PDF is downloaded once and cached. Errors are logged and returned as text.
 */
export async function extractTextFromPdf(pdfBase64) {
    try {
        if (!cachedPdfBytes) {
            cachedPdfBytes = await fetchAsUint8Array(pdfUrl);
        }

        const pdfDocument = new PdfDocument(cachedPdfBytes);
        try {
            const extractor = new PdfDataExtractor(pdfDocument);
            const textCollection = extractor.extractTextLinesSync({
                startPageIndex: 0,
                endPageIndex: 0
            });

            let content = '';
            for (let i = 0; i < textCollection.length; i++) {
                content += textCollection[i].text + '\n';
            }
            return content;
        } finally {
            pdfDocument.destroy();
        }
    } catch (error) {
        console.error('PDF text extraction failed:', error);
        return `Error: ${error}`;
    }
}

export function getDefaultSearchText() {
    return defaultSearchText;
}

async function getSourcePdfBytes() {
    if (!cachedPdfBytes) {
        cachedPdfBytes = await fetchAsUint8Array(pdfUrl);
    }
    return cachedPdfBytes;
}

function searchDocument(pdfDocument, searchText) {
    const extractor = new PdfDataExtractor(pdfDocument);
    return extractor.findTextSync(searchText, {
        caseSensitive: false,
        wholeWord: false,
        startPageIndex: 0,
        endPageIndex: pdfDocument.pageCount - 1
    });
}

/**
 * Searches all pages of the sample PDF and returns the matches as display text.
 * Does not modify or save the PDF.
 */
export async function findText(searchText) {
    try {
        if (!searchText || !searchText.trim()) {
            return 'Error: Please enter the text to search.';
        }
        const pdfDocument = new PdfDocument(await getSourcePdfBytes());
        try {
            const result = searchDocument(pdfDocument, searchText);
            let total = 0;
            let details = '';
            result.searchResults.forEach((bounds, pageNumber) => {
                bounds.forEach((b, i) => {
                    total++;
                    details += `Page ${pageNumber}, match ${i + 1}: "${result.searchText}" ` +
                        `bounds { x: ${b.x.toFixed(2)}, y: ${b.y.toFixed(2)}, ` +
                        `width: ${b.width.toFixed(2)}, height: ${b.height.toFixed(2)} }\n`;
                });
            });
            const header = `Search text: "${result.searchText}"\n` +
                `Pages searched: ${pdfDocument.pageCount}\n` +
                `Pages with matches: ${result.searchResults.size}\n` +
                `Result count: ${total}\n\n`;
            return total === 0 ? header + 'No matches found.' : header + details;
        } finally {
            pdfDocument.destroy();
        }
    } catch (error) {
        console.error('PDF text search failed:', error);
        return `Error: ${error}`;
    }
}

/**
 * Searches the sample PDF, draws a coloured rectangle around every match and
 * returns the modified PDF as base64.
 */
export async function highlightSearchResults(searchText) {
    if (!searchText || !searchText.trim()) {
        throw new Error('Please enter the text to search.');
    }
    const pdfDocument = new PdfDocument(await getSourcePdfBytes());
    try {
        const result = searchDocument(pdfDocument, searchText);
        let count = 0;
        result.searchResults.forEach((bounds, pageNumber) => {
            const graphics = pdfDocument.getPage(pageNumber - 1).graphics;
            bounds.forEach((b) => {
                const pen = new PdfPen(highlightColors[count % highlightColors.length], 1);
                graphics.drawRectangle({ x: b.x, y: b.y, width: b.width, height: b.height }, pen);
                count++;
            });
        });
        if (count === 0) {
            throw new Error(`No matches found for "${searchText}".`);
        }
        return toBase64(await pdfDocument.save());
    } finally {
        pdfDocument.destroy();
    }
}
