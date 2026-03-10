// @ts-nocheck
let monaco: any = null;
let diffEditor: any = null;
let originalModel: any = null;
let modifiedModel: any = null;

async function loadMonaco() {
  if (monaco) return monaco;

  const module = await import(/* @vite-ignore */ 'https://esm.sh/monaco-editor');
  monaco = module.default;

  window.MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
      const workers: Record<string, string> = {
        'editorWorkerService': 'https://esm.sh/monaco-editor/esm/vs/editor/editor.worker.js',
        'css': 'https://esm.sh/monaco-editor/esm/vs/language/css/css.worker.js',
        'html': 'https://esm.sh/monaco-editor/esm/vs/language/html/html.worker.js',
        'javascript': 'https://esm.sh/monaco-editor/esm/vs/language/typescript/ts.worker.js',
        'json': 'https://esm.sh/monaco-editor/esm/vs/language/json/json.worker.js',
        'typescript': 'https://esm.sh/monaco-editor/esm/vs/language/typescript/ts.worker.js',
      };

      const workerUrl = workers[label] || workers['editorWorkerService'];
      return new Worker(workerUrl, { type: 'module' });
    }
  };

  return monaco;
}

// 获取当前主题
function getCurrentTheme(): 'vs' | 'vs-dark' {
  return document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs';
}

// 初始化 Diff Editor
async function initDiffEditor() {
  const container = document.getElementById('editor-container');
  if (!container) return;

  // 加载 Monaco
  await loadMonaco();

  // 创建模型
  originalModel = monaco.editor.createModel('', 'plaintext');
  modifiedModel = monaco.editor.createModel('', 'plaintext');

  // 创建 Diff Editor
  diffEditor = monaco.editor.createDiffEditor(container, {
    theme: getCurrentTheme(),
    renderSideBySide: true,
    readOnly: false,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    lineHeight: 20,
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    wordWrap: 'on',
    wrappingIndent: 'indent',
    diffAlgorithm: 'advanced',
    ignoreTrimWhitespace: false,
    renderIndicators: true,
    renderMarginRevertIcon: false,
    originalEditable: true,
    renderOverviewRuler: true,
  });

  // 设置模型
  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel,
  });

  // 监听编辑器内容变化
  originalModel.onDidChangeContent(() => {
    updateStatistics();
  });
  modifiedModel.onDidChangeContent(() => {
    updateStatistics();
  });

  // 监听暗色模式变化
  const darkModeObserver = new MutationObserver(() => {
    if (diffEditor) {
      monaco.editor.setTheme(getCurrentTheme());
    }
  });

  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  return diffEditor;
}

// 设置语言
function setLanguage(language: string) {
  if (!originalModel || !modifiedModel) return;
  
  monaco.editor.setModelLanguage(originalModel, language);
  monaco.editor.setModelLanguage(modifiedModel, language);
}

// 设置对比模式
function setCompareMode(mode: 'line' | 'word' | 'char') {
  if (!diffEditor) return;
  
  const options = diffEditor.getOptions();
  const diffAlgorithm = mode === 'line' ? 'advanced' : 'legacy';
  
  diffEditor.updateOptions({
    diffAlgorithm,
    ignoreTrimWhitespace: mode === 'line',
  });
}

// 设置布局模式
function setLayoutMode(mode: 'side-by-side' | 'inline') {
  if (!diffEditor) return;
  
  diffEditor.updateOptions({
    renderSideBySide: mode === 'side-by-side',
  });
}

// 获取文本内容
function getTexts() {
  if (!originalModel || !modifiedModel) {
    return { original: '', modified: '' };
  }
  
  return {
    original: originalModel.getValue(),
    modified: modifiedModel.getValue(),
  };
}

// 设置文本内容
function setTexts(original: string, modified: string) {
  if (!originalModel || !modifiedModel) return;
  
  originalModel.setValue(original);
  modifiedModel.setValue(modified);
}

// 清空文本
function clearTexts() {
  setTexts('', '');
}

// 计算统计信息
function calculateStatistics() {
  const { original, modified } = getTexts();
  
  // 计算字符数
  const originalCount = original.length;
  const modifiedCount = modified.length;
  
  // 计算差异行数
  const originalLines = original.split('\n').length;
  const modifiedLines = modified.split('\n').length;
  const diffLines = Math.abs(originalLines - modifiedLines);
  
  // 计算相似度（简单实现）
  const longer = Math.max(originalCount, modifiedCount);
  const shorter = Math.min(originalCount, modifiedCount);
  const similarity = longer === 0 ? 100 : Math.round((shorter / longer) * 100);
  
  return {
    originalCount,
    modifiedCount,
    diffLines,
    similarity,
  };
}

// 更新统计信息显示
function updateStatistics() {
  const stats = calculateStatistics();
  
  const originalCountEl = document.getElementById('original-count');
  const modifiedCountEl = document.getElementById('modified-count');
  const diffLinesEl = document.getElementById('diff-lines');
  const similarityEl = document.getElementById('similarity');
  
  if (originalCountEl) originalCountEl.textContent = stats.originalCount.toString();
  if (modifiedCountEl) modifiedCountEl.textContent = stats.modifiedCount.toString();
  if (diffLinesEl) diffLinesEl.textContent = stats.diffLines.toString();
  if (similarityEl) similarityEl.textContent = `${stats.similarity}%`;
}

// 初始化事件监听
function initEventListeners() {
  // 语言选择
  const languageSelect = document.getElementById('language') as HTMLSelectElement;
  if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
      const language = (e.target as HTMLSelectElement).value;
      setLanguage(language);
    });
  }

  // 对比模式
  const compareModeSelect = document.getElementById('compare-mode') as HTMLSelectElement;
  if (compareModeSelect) {
    compareModeSelect.addEventListener('change', (e) => {
      const mode = (e.target as HTMLSelectElement).value as 'line' | 'word' | 'char';
      setCompareMode(mode);
    });
  }

  // 布局切换 - 并排
  const layoutSideBySideBtn = document.getElementById('layout-side-by-side');
  const layoutInlineBtn = document.getElementById('layout-inline');
  
  if (layoutSideBySideBtn && layoutInlineBtn) {
    layoutSideBySideBtn.addEventListener('click', () => {
      setLayoutMode('side-by-side');
      layoutSideBySideBtn.classList.add('bg-primary/10', 'text-primary', 'dark:bg-primary/20');
      layoutSideBySideBtn.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300');
      layoutInlineBtn.classList.remove('bg-primary/10', 'text-primary', 'dark:bg-primary/20');
      layoutInlineBtn.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300');
    });

    layoutInlineBtn.addEventListener('click', () => {
      setLayoutMode('inline');
      layoutInlineBtn.classList.add('bg-primary/10', 'text-primary', 'dark:bg-primary/20');
      layoutInlineBtn.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300');
      layoutSideBySideBtn.classList.remove('bg-primary/10', 'text-primary', 'dark:bg-primary/20');
      layoutSideBySideBtn.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300');
    });
  }

  // 全屏切换
  const toggleFullscreenBtn = document.getElementById('toggle-fullscreen');
  const editorContainer = document.getElementById('editor-container')?.parentElement;
  
  if (toggleFullscreenBtn && editorContainer) {
    // 更新全屏按钮状态
    function updateFullscreenButtonState() {
      if (document.fullscreenElement) {
        toggleFullscreenBtn.innerHTML = `
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
          </svg>
          退出全屏
        `;
      } else {
        toggleFullscreenBtn.innerHTML = `
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
          全屏
        `;
      }
    }

    toggleFullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        editorContainer.requestFullscreen().catch(err => {
          console.error('无法进入全屏模式:', err);
        });
      } else {
        document.exitFullscreen();
      }
    });

    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', updateFullscreenButtonState);
  }

  // 清空按钮
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearTexts();
      updateStatistics();
    });
  }

  // 对比按钮
  const compareBtn = document.getElementById('compare-btn');
  if (compareBtn) {
    compareBtn.addEventListener('click', () => {
      updateStatistics();
    });
  }

  // Ctrl+Enter / Cmd+Enter 快捷键触发对比
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      updateStatistics();
    }
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDiffEditor();
    initEventListeners();
    updateStatistics();
  } catch (error) {
    console.error('初始化 Monaco Editor 失败:', error);
    const container = document.getElementById('editor-container');
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
          <p>编辑器加载失败，请刷新页面重试</p>
        </div>
      `;
    }
  }
});