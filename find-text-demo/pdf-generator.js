// PDF logic only (no DOM access): generation, text extraction, search and highlighting.
import {
    PdfDocument,
    PdfPageSettings,
    PdfMargins,
    PdfBrush,
    PdfPen,
    PdfStringFormat,
    PdfTextDirection,
    PdfTextAlignment,
    PdfTrueTypeFont
} from '@syncfusion/ej2-pdf';
import { PdfDataExtractor } from '@syncfusion/ej2-pdf-data-extract';

const ARABIC_FONT_URL = 'https://cdn.syncfusion.com/content/pdf-resources/noto-naskh-arabic-regular.ttf';

export const DEFAULT_SEARCH_TEXT = 'ملف';

export const DEFAULT_ARABIC_TEXT =
`سنبدأ بنظرة عامة مفاهيمية على مستند PDF بسيط. تم تصميم هذا الفصل ليكون توجيهًا مختصرًا قبل الغوص في مستند حقيقي وإنشاءه من البداية.
يمكن تقسيم ملف PDF إلى أربعة أجزاء: الرأس والجسم والجدول الإسناد الترافقي والمقطورة. يضع الرأس الملف كملف PDF ، حيث يحدد النص المستند المرئي ، ويسرد جدول الإسناد الترافقي موقع كل شيء في الملف ، ويوفر المقطع الدعائي تعليمات حول كيفية بدء قراءة الملف.
رأس الصفحة هو ببساطة رقم إصدار PDF وتسلسل عشوائي للبيانات الثنائية. البيانات الثنائية تمنع التطبيقات الساذجة من معالجة ملف PDF كملف نصي. سيؤدي ذلك إلى ملف تالف ، لأن ملف PDF يتكون عادةً من نص عادي وبيانات ثنائية (على سبيل المثال ، يمكن تضمين ملف خط ثنائي بشكل مباشر في ملف PDF).`;

const HIGHLIGHT_COLOR = { r: 255, g: 0, b: 0 };

let cachedFontBytes = null;

async function fetchBytes(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download resource (${response.status} ${response.statusText}): ${url}`);
    }
    return new Uint8Array(await response.arrayBuffer());
}

/** Loads the bundled sample PDF. */
export function loadSamplePdf() {
    return fetchBytes(new URL('./assets/sample.pdf', import.meta.url).href);
}

/**
 * Generates a PDF containing right-to-left Arabic text. Text that does not fit on a
 * page flows onto additional pages.
 * @returns {Promise<Uint8Array>}
 */
export async function generateArabicPdf(text, fontSize = 13) {
    if (!cachedFontBytes) {
        cachedFontBytes = await fetchBytes(ARABIC_FONT_URL);
    }
    const pdf = new PdfDocument();
    try {
        const page = pdf.addPage(new PdfPageSettings({ margins: new PdfMargins(40) }));
        const size = page.graphics.clientSize;
        const format = new PdfStringFormat();
        format.textDirection = PdfTextDirection.rightToLeft;
        format.alignment = PdfTextAlignment.right;
        const font = new PdfTrueTypeFont(cachedFontBytes, fontSize);
        const content = text && text.trim() ? text : DEFAULT_ARABIC_TEXT;
        page.graphics.drawString(content, font, { x: 0, y: 0, width: size.width, height: size.height }, new PdfBrush({ r: 0, g: 0, b: 0 }), format);
        return await pdf.save();
    } finally {
        pdf.destroy();
    }
}

/** Extracts the RTL-ordered text of the whole document. */
export async function extractText(pdfBytes) {
    const pdf = new PdfDocument(pdfBytes);
    try {
        const extractor = new PdfDataExtractor(pdf);
        return await extractor.extractText({ startPageIndex: 0, endPageIndex: pdf.pageCount - 1 });
    } finally {
        pdf.destroy();
    }
}

function search(pdf, searchText, options) {
    const extractor = new PdfDataExtractor(pdf);
    return extractor.findTextSync(searchText, {
        caseSensitive: !!options.caseSensitive,
        wholeWord: !!options.wholeWord,
        startPageIndex: 0,
        endPageIndex: pdf.pageCount - 1
    });
}

/**
 * Finds every occurrence of the text.
 * @returns {Promise<{pageCount:number, matches:Array<{pageIndex:number, bounds:{x:number,y:number,width:number,height:number}}>}>}
 *   pageIndex is zero-based.
 */
export async function findText(pdfBytes, searchText, options = {}) {
    if (!searchText || !searchText.trim()) {
        throw new Error('Please enter the text to search.');
    }
    const pdf = new PdfDocument(pdfBytes);
    try {
        const result = search(pdf, searchText, options);
        const matches = [];
        // Map keys are one-based page numbers.
        result.searchResults.forEach((rects, pageNumber) => {
            rects.forEach((b) => matches.push({
                pageIndex: pageNumber - 1,
                bounds: { x: b.x, y: b.y, width: b.width, height: b.height }
            }));
        });
        matches.sort((a, b) => a.pageIndex - b.pageIndex || a.bounds.y - b.bounds.y || b.bounds.x - a.bounds.x);
        return { pageCount: pdf.pageCount, matches };
    } finally {
        pdf.destroy();
    }
}

/**
 * Draws a red rectangle around every match (PdfGraphics.drawRectangle) and saves the PDF.
 * The original bytes are never modified.
 * @returns {Promise<Uint8Array>}
 */
export async function highlightMatches(pdfBytes, matches) {
    const pdf = new PdfDocument(pdfBytes);
    try {
        const pen = new PdfPen(HIGHLIGHT_COLOR, 1);
        for (const { pageIndex, bounds } of matches) {
            pdf.getPage(pageIndex).graphics.drawRectangle(bounds, pen);
        }
        return await pdf.save();
    } finally {
        pdf.destroy();
    }
}
