import { Transformer } from 'markmap-lib';
import { Markmap, loadCSS, loadJS, deriveOptions } from 'markmap-view';

type ViewMode = 'md' | 'markmap';

const STORAGE_PREFIX = 'markdown-view-mode';
const MOBILE_BREAKPOINT = 768;

function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function getStorageKey(postId: string): string {
  return `${STORAGE_PREFIX}:${postId}`;
}

function getSavedMode(postId: string): ViewMode {
  if (typeof window === 'undefined') return 'md';
  const saved = localStorage.getItem(getStorageKey(postId));
  return (saved as ViewMode) || 'md';
}

function saveMode(postId: string, mode: ViewMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(postId), mode);
}

function extractMarkdownFromHTML(): string {
  const articleContent = document.querySelector('.article-content .prose');
  if (!articleContent) return '';

  const headings = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const lines: string[] = [];

  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1));
    const prefix = '#'.repeat(level);
    const text = heading.textContent?.trim() || '';
    lines.push(`${prefix} ${text}`);
  });

  return lines.join('\n');
}

async function renderMarkmap(
  container: HTMLElement,
  markdown: string
): Promise<Markmap | null> {
  const svgSelector = container.querySelector('svg.markmap-svg');
  if (!svgSelector) return null;

  const transformer = new Transformer();
  const { root, features } = transformer.transform(markdown);
  const { styles, scripts } = transformer.getUsedAssets(features);

  if (styles) {
    loadCSS(styles);
  }
  if (scripts) {
    loadJS(scripts, {
      getMarkmap: () => ({ Markmap, loadCSS, loadJS }),
    });
  }

  const isDark = document.documentElement.classList.contains('dark');
  
  const options = deriveOptions({
    color: isDark
      ? ['#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6']
      : ['#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706'],
    duration: 300,
    maxWidth: 300,
    spacingHorizontal: 80,
    spacingVertical: 8,
    initialExpandLevel: 2,
    zoom: true,
    pan: true,
  });

  const mm = Markmap.create(svgSelector as SVGElement, options, root);
  await mm.fit();

  (container as any).__markmapInstance = mm;

  return mm;
}

function createMarkmapContainer(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'markmap-container';
  container.innerHTML = `
    <svg class="markmap-svg" style="width: 100%; height: 500px;"></svg>
    <div class="markmap-toolbar">
      <button class="markmap-btn markmap-reset-btn" title="重置视图" aria-label="重置视图">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M65.9 228.5c13.3-93 93.4-164.5 190.1-164.5 53 0 101 21.5 135.8 56.2 .2 .2 .4 .4 .6 .6l7.6 7.2-47.9 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 53.4-11.3-10.7C390.5 28.6 326.5 0 256 0 127 0 20.3 95.4 2.6 219.5 .1 237 12.2 253.2 29.7 255.7s33.7-9.7 36.2-27.1zm443.5 64c2.5-17.5-9.7-33.7-27.1-36.2s-33.7 9.7-36.2 27.1c-13.3 93-93.4 164.5-190.1 164.5-53 0-101-21.5-135.8-56.2-.2-.2-.4-.4-.6-.6l-7.6-7.2 47.9 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 320c-8.5 0-16.7 3.4-22.7 9.5S-.1 343.7 0 352.3l1 127c.1 17.7 14.6 31.9 32.3 31.7S65.2 496.4 65 478.7l-.4-51.5 10.7 10.1c46.3 46.1 110.2 74.7 180.7 74.7 129 0 235.7-95.4 253.4-219.5z"/>
        </svg>
      </button>
      <button class="markmap-btn markmap-fullscreen-btn" title="全屏展示" aria-label="切换全屏模式">
        <svg class="icon-maximize" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32S0 334.3 0 352l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"/>
        </svg>
        <svg class="icon-minimize hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M160 64c0-17.7-14.3-32-32-32S96 46.3 96 64l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 320c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0z"/>
        </svg>
      </button>
    </div>
  `;
  
  const resetBtn = container.querySelector('.markmap-reset-btn');
  resetBtn?.addEventListener('click', () => {
    resetMarkmapView(container);
  });
  
  const fullscreenBtn = container.querySelector('.markmap-fullscreen-btn');
  fullscreenBtn?.addEventListener('click', () => {
    toggleFullscreen(container);
  });
  
  return container;
}

function resetMarkmapView(container: HTMLElement): void {
  const mm = (container as any).__markmapInstance;
  if (mm && typeof mm.fit === 'function') {
    mm.fit();
  }
}

function toggleFullscreen(container: HTMLElement): void {
  const maximizeIcon = container.querySelector('.icon-maximize');
  const minimizeIcon = container.querySelector('.icon-minimize');
  const fullscreenBtn = container.querySelector('.markmap-fullscreen-btn');
  
  if (container.classList.contains('fullscreen')) {
    container.classList.remove('fullscreen');
    document.body.style.overflow = '';
    
    const svg = container.querySelector('svg.markmap-svg') as SVGElement;
    if (svg) {
      svg.style.minHeight = '400px';
      svg.style.maxHeight = '600px';
    }
    
    maximizeIcon?.classList.remove('hidden');
    minimizeIcon?.classList.add('hidden');
    if (fullscreenBtn) {
      fullscreenBtn.setAttribute('title', '全屏展示');
      fullscreenBtn.setAttribute('aria-label', '全屏展示');
    }
  } else {
    container.classList.add('fullscreen');
    document.body.style.overflow = 'hidden';
    
    const svg = container.querySelector('svg.markmap-svg') as SVGElement;
    if (svg) {
      svg.style.minHeight = '100%';
      svg.style.maxHeight = 'none';
    }
    
    maximizeIcon?.classList.add('hidden');
    minimizeIcon?.classList.remove('hidden');
    if (fullscreenBtn) {
      fullscreenBtn.setAttribute('title', '退出全屏');
      fullscreenBtn.setAttribute('aria-label', '退出全屏');
    }
  }
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    const fullscreenContainer = document.querySelector('.markmap-container.fullscreen');
    if (fullscreenContainer) {
      toggleFullscreen(fullscreenContainer as HTMLElement);
    }
  }
}

function restoreArticleContent(articleWrapper: HTMLElement): HTMLElement | null {
  const articleContent = articleWrapper.querySelector('.article-content');
  if (!articleContent) return null;

  articleWrapper.querySelectorAll('.markmap-container').forEach((el) => el.remove());
  
  articleContent.classList.remove('hidden');
  
  if (!articleWrapper.contains(articleContent)) {
    articleWrapper.appendChild(articleContent);
  }
  
  return articleContent as HTMLElement;
}

function updateView(
  mode: ViewMode,
  toggleContainer: HTMLElement,
  articleWrapper: HTMLElement
): void {
  const buttons = toggleContainer.querySelectorAll('.toggle-btn');
  buttons.forEach((btn) => {
    const btnMode = btn.getAttribute('data-view') as ViewMode;
    btn.classList.toggle('active', btnMode === mode);
  });

  const articleContent = restoreArticleContent(articleWrapper);
  if (!articleContent) return;

  if (mode === 'markmap') {
    articleContent.classList.add('hidden');
    
    const markmapContainer = createMarkmapContainer();
    articleWrapper.insertBefore(markmapContainer, articleContent);
    
    const markdown = extractMarkdownFromHTML();
    if (markdown) {
      renderMarkmap(markmapContainer, markdown);
    }
  }
}

function initMarkdownViewToggle(): void {
  const toggleWrapper = document.querySelector('.markdown-view-toggle');
  if (!toggleWrapper) return;

  const postId = toggleWrapper.getAttribute('data-post-id');
  if (!postId) return;

  const articleWrapper = document.querySelector('.article-content-wrapper');
  if (!articleWrapper) return;

  if (isMobile()) {
    return;
  }

  const savedMode = getSavedMode(postId);
  updateView(savedMode, toggleWrapper as HTMLElement, articleWrapper as HTMLElement);

  const buttons = toggleWrapper.querySelectorAll('.toggle-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-view') as ViewMode;
      saveMode(postId, mode);
      updateView(mode, toggleWrapper as HTMLElement, articleWrapper as HTMLElement);
    });
  });

  const observer = new MutationObserver(() => {
    const markmapContainer = articleWrapper.querySelector('.markmap-container');
    if (markmapContainer) {
      const currentMode = getSavedMode(postId);
      updateView(currentMode, toggleWrapper as HTMLElement, articleWrapper as HTMLElement);
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  document.addEventListener('keydown', handleKeydown);

  window.addEventListener('resize', () => {
    if (isMobile()) {
      restoreArticleContent(articleWrapper as HTMLElement);
    }
  });
}

export function init() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarkdownViewToggle);
  } else {
    initMarkdownViewToggle();
  }
}

export { initMarkdownViewToggle };
