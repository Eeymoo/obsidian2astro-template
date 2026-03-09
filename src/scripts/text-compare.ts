declare global {
  interface Window {
    diff_match_patch: new () => DiffMatchPatch;
    hljs: {
      highlight: (code: string, options: { language: string }) => { value: string };
    };
  }
}

interface DiffMatchPatch {
  diff_main(text1: string, text2: string): Diff[];
  diff_cleanupSemantic(diffs: Diff[]): void;
}

interface Diff {
  0: number;
  1: string;
}

interface DiffResult {
  added: number;
  removed: number;
  unchanged: number;
  html: string;
}

function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function getTextStats(text: string) {
  const lines = text ? text.split('\n').length : 0;
  const chars = text.length;
  return { lines, chars };
}

function updateStats(original: string, modified: string) {
  const originalStats = getElement('original-stats');
  const modifiedStats = getElement('modified-stats');

  if (originalStats && modifiedStats) {
    const originalStat = getTextStats(original);
    const modifiedStat = getTextStats(modified);

    originalStats.textContent = `${originalStat.lines} 行, ${originalStat.chars} 字符`;
    modifiedStats.textContent = `${modifiedStat.lines} 行, ${modifiedStat.chars} 字符`;
  }
}

function computeDiff(text1: string, text2: string, mode: string): DiffResult {
  const dmp = new window.diff_match_patch();

  let diffs: Diff[];

  if (mode === 'char') {
    diffs = dmp.diff_main(text1, text2);
  } else if (mode === 'word') {
    const text1Words = text1.replace(/\n/g, ' ');
    const text2Words = text2.replace(/\n/g, ' ');
    diffs = dmp.diff_main(text1Words, text2Words);
  } else {
    diffs = dmp.diff_main(text1, text2);
  }

  dmp.diff_cleanupSemantic(diffs);

  let added = 0;
  let removed = 0;
  let unchanged = 0;

  for (const diff of diffs) {
    if (diff[0] === 1) {
      added += diff[1].length;
    } else if (diff[0] === -1) {
      removed += diff[1].length;
    } else {
      unchanged += diff[1].length;
    }
  }

  const html = generateDiffHtml(diffs, mode);

  return { added, removed, unchanged, html };
}

function generateDiffHtml(diffs: Diff[], mode: string): string {
  const html: string[] = [];

  for (const diff of diffs) {
    const type = diff[0];
    const text = escapeHtml(diff[1]);

    if (type === 0) {
      html.push(`<span class="diff-unchanged">${text}</span>`);
    } else if (type === -1) {
      if (mode === 'line') {
        html.push(`<span class="diff-removed">${text}</span>`);
      } else {
        html.push(`<span class="diff-removed">${highlightText(text)}</span>`);
      }
    } else if (type === 1) {
      if (mode === 'line') {
        html.push(`<span class="diff-added">${text}</span>`);
      } else {
        html.push(`<span class="diff-added">${highlightText(text)}</span>`);
      }
    }
  }

  return html.join('');
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function highlightText(text: string): string {
  const languageSelect = getElement<HTMLSelectElement>('language-select');
  const language = languageSelect?.value || 'plaintext';

  if (language === 'plaintext' || !window.hljs) {
    return escapeHtml(text);
  }

  try {
    const lines = text.split('\n');
    const highlighted: string[] = [];

    for (const line of lines) {
      if (line.trim()) {
        const result = window.hljs.highlight(line, { language });
        highlighted.push(result.value);
      } else {
        highlighted.push('');
      }
    }

    return highlighted.join('\n');
  } catch {
    return escapeHtml(text);
  }
}

function showDiffResult(result: DiffResult): void {
  const diffResult = getElement('diff-result');
  const diffStats = getElement('diff-stats');
  const statAdded = getElement('stat-added');
  const statRemoved = getElement('stat-removed');
  const statUnchanged = getElement('stat-unchanged');

  if (!diffResult || !diffStats || !statAdded || !statRemoved || !statUnchanged) {
    return;
  }

  statAdded.textContent = result.added.toString();
  statRemoved.textContent = result.removed.toString();
  statUnchanged.textContent = result.unchanged.toString();

  diffStats.classList.remove('hidden');
  diffResult.innerHTML = `<pre class="diff-content"><code>${result.html}</code></pre>`;
}

function clearContent(): void {
  const textOriginal = getElement<HTMLTextAreaElement>('text-original');
  const textModified = getElement<HTMLTextAreaElement>('text-modified');
  const diffResult = getElement('diff-result');
  const diffStats = getElement('diff-stats');
  const originalStats = getElement('original-stats');
  const modifiedStats = getElement('modified-stats');

  if (textOriginal) textOriginal.value = '';
  if (textModified) textModified.value = '';
  if (originalStats) originalStats.textContent = '';
  if (modifiedStats) modifiedStats.textContent = '';
  if (diffStats) diffStats.classList.add('hidden');
  if (diffResult) {
    diffResult.innerHTML = '<p class="text-sm text-slate-400 text-center">点击"对比"按钮查看差异结果</p>';
  }
}

function performCompare(): void {
  const textOriginal = getElement<HTMLTextAreaElement>('text-original');
  const textModified = getElement<HTMLTextAreaElement>('text-modified');
  const diffMode = getElement<HTMLSelectElement>('diff-mode');

  if (!textOriginal || !textModified || !diffMode) {
    return;
  }

  const original = textOriginal.value;
  const modified = textModified.value;
  const mode = diffMode.value;

  updateStats(original, modified);

  if (!original && !modified) {
    const diffResult = getElement('diff-result');
    if (diffResult) {
      diffResult.innerHTML = '<p class="text-sm text-slate-400 text-center">请输入要对比的文本</p>';
    }
    return;
  }

  const result = computeDiff(original, modified, mode);
  showDiffResult(result);
}

function initEventListeners(): void {
  const compareBtn = getElement('compare-btn');
  const clearBtn = getElement('clear-btn');
  const textOriginal = getElement<HTMLTextAreaElement>('text-original');
  const textModified = getElement<HTMLTextAreaElement>('text-modified');
  const diffMode = getElement<HTMLSelectElement>('diff-mode');
  const languageSelect = getElement<HTMLSelectElement>('language-select');

  if (compareBtn) {
    compareBtn.addEventListener('click', performCompare);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', clearContent);
  }

  if (textOriginal) {
    textOriginal.addEventListener('input', () => {
      updateStats(textOriginal.value, textModified?.value || '');
    });
  }

  if (textModified) {
    textModified.addEventListener('input', () => {
      updateStats(textOriginal?.value || '', textModified.value);
    });
  }

  if (diffMode) {
    diffMode.addEventListener('change', () => {
      const textOriginalVal = textOriginal?.value;
      const textModifiedVal = textModified?.value;
      if (textOriginalVal || textModifiedVal) {
        performCompare();
      }
    });
  }

  if (languageSelect) {
    languageSelect.addEventListener('change', () => {
      const textOriginalVal = textOriginal?.value;
      const textModifiedVal = textModified?.value;
      if (textOriginalVal || textModifiedVal) {
        performCompare();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      performCompare();
    }
  });
}

export function initTextCompare(): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventListeners);
  } else {
    initEventListeners();
  }
}
