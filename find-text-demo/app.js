// UI logic only. All PDF work lives in pdf-generator.js.
import {
    DEFAULT_ARABIC_TEXT,
    DEFAULT_SEARCH_TEXT,
    generateArabicPdf,
    loadSamplePdf,
    extractText,
    findText,
    highlightMatches
} from './pdf-generator.js';

const $ = (id) => document.getElementById(id);
const el = {
    search: $('searchText'), results: $('results'),
    viewer: $('viewer'),
    caseSensitive: $('caseSensitive'), wholeWord: $('wholeWord'),
    generate: $('generateBtn'), extract: $('extractBtn'),
    findHighlight: $('findHighlightBtn'), download: $('downloadBtn')
};

const state = {
    original: null,       // bytes of the loaded/generated PDF (never modified)
    displayed: null,      // bytes currently shown (original or highlighted)
    fileName: 'document.pdf',
    matches: [],
    viewerUrl: null
};

el.search.value = DEFAULT_SEARCH_TEXT;

function updateControls() {
    const hasPdf = !!state.original;
    el.generate.disabled = false;
    el.extract.disabled = !hasPdf;
    el.findHighlight.disabled = !hasPdf;
    el.download.disabled = !state.displayed;
}

async function run(task) {
    const buttons = [el.generate, el.extract, el.findHighlight, el.download];
    buttons.forEach((b) => (b.disabled = true));
    try {
        await task();
    } catch (error) {
        console.error(error);
        el.results.textContent = `Error: ${error.message || error}`;
    } finally {
        updateControls();
    }
}

function show(bytes, page = 1) {
    state.displayed = bytes;
    if (state.viewerUrl) URL.revokeObjectURL(state.viewerUrl);
    state.viewerUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    el.viewer.src = `${state.viewerUrl}#page=${page}&toolbar=0&navpanes=0`;
    el.viewer.hidden = false;
}

function setPdf(bytes, name) {
    state.original = bytes;
    state.fileName = name;
    state.matches = [];
    el.results.textContent = 'Search results will appear here...';
    show(bytes);
}

el.generate.onclick = () => run(async () => {
    const bytes = await generateArabicPdf(DEFAULT_ARABIC_TEXT);
    downloadPdf(bytes, 'arabic.pdf');
});

el.extract.onclick = () => run(async () => {
    const text = await extractText(state.original);
    state.matches = [];
    el.results.textContent = text || '(no text found)';
});

el.findHighlight.onclick = () => run(async () => {
    const { pageCount, matches } = await findText(state.original, el.search.value, {
        caseSensitive: el.caseSensitive.checked,
        wholeWord: el.wholeWord.checked
    });
    state.matches = matches;

    const lines = [`Search text: "${el.search.value}"`, `Pages searched: ${pageCount}`, `Result count: ${matches.length}`, ''];
    matches.forEach((m, i) => lines.push(
        `#${i + 1} page ${m.pageIndex + 1}: { x: ${m.bounds.x.toFixed(2)}, y: ${m.bounds.y.toFixed(2)}, ` +
        `width: ${m.bounds.width.toFixed(2)}, height: ${m.bounds.height.toFixed(2)} }`));
    el.results.textContent = matches.length ? lines.join('\n') : lines.join('\n') + 'No matches found.';

    if (!matches.length) {
        show(state.original);
        return;
    }

    const firstPage = matches[0].pageIndex + 1;
    const highlightedBytes = await highlightMatches(state.original, matches);
    show(highlightedBytes, firstPage);
});

function downloadPdf(bytes, fileName) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

el.download.onclick = () => downloadPdf(state.displayed,
    state.displayed === state.original ? state.fileName : state.fileName.replace(/\.pdf$/i, '') + '-highlighted.pdf');

el.search.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !el.findHighlight.disabled) el.findHighlight.click(); });

updateControls();
run(async () => {
    setPdf(await loadSamplePdf(), 'sample.pdf');
});
