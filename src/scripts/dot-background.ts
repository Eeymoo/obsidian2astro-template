/**
 * dot-background.ts - Canvas 动态几何顶点背景核心渲染逻辑
 *
 * 功能：
 * - 确定性随机种子（基于日期）
 * - 多边形网格（三角形/正方形/六边形）
 * - 鼠标视差效果
 * - 最近点高亮
 * - 主题颜色响应
 */

// ============ 类型定义 ============

interface Point {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  targetRadius: number;
}

interface MousePosition {
  x: number;
  y: number;
}

interface AnimationState {
  offsetX: number;
  offsetY: number;
}

// ============ 常量配置 ============

const PADDING = 200;
const MAX_OFFSET = 200;
const TRANSITION_DURATION = 0.3;
const DEBOUNCE_DELAY = 200;

// 颜色配置
const COLORS = {
  light: '#e2e8f0', // slate-200 (柔和对比度)
  dark: '#334155', // slate-700 (柔和对比度)
} as const;

// ============ 背景配置 ============

export interface BgConfig {
  dotSize: number;
  dotSizeHighlight: number;
  dotGap: number;
  polygonSides: number[];
  showLines?: boolean;
}

const DEFAULT_CONFIG: BgConfig = {
  dotSize: 1,
  dotSizeHighlight: 2,
  dotGap: 33,
  polygonSides: [3, 4, 6],
  showLines: false,
};

// 当前配置（运行时从全局变量读取）
export let config = DEFAULT_CONFIG;

// ============ 模块状态 ============

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let points: Point[] = [];
let mouse: MousePosition = { x: 0, y: 0 };
let animation: AnimationState = { offsetX: 0, offsetY: 0 };
let rafId: number | null = null;
let isDarkMode = false;
let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
let mutationObserver: MutationObserver | null = null;
let currentSides: number = 4;

// ============ 确定性随机数生成器 ============

/**
 * 创建基于日期字符串的确定性伪随机数生成器
 * 同一天生成的随机序列相同
 */
function createSeededRandom(seed: string): () => number {
  // 使用简单哈希将字符串转为数字种子
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }

  // Mulberry32 算法
  let state = hash >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============ 网格生成 ============

/**
 * 根据多边形边数生成点阵
 * @param sides 多边形边数 (3, 4, 6)
 * @param width Canvas 宽度
 * @param height Canvas 高度
 * @param random 伪随机数生成器
 */
function generatePoints(
  sides: number,
  width: number,
  height: number,
  random: () => number
): Point[] {
  const pts: Point[] = [];
  const extendX = PADDING;
  const extendY = PADDING;

  switch (sides) {
    case 3: // 正三角形网格
      generateTriangleGrid(pts, width, height, extendX, extendY);
      break;
    case 4: // 正方形网格
      generateSquareGrid(pts, width, height, extendX, extendY);
      break;
    case 6: // 正六边形网格（蜂窝状）
      generateHexagonGrid(pts, width, height, extendX, extendY);
      break;
    default:
      generateSquareGrid(pts, width, height, extendX, extendY);
  }

  // 添加微小随机偏移使效果更自然
  // 注意：jitter 只作用在 x/y，baseX/baseY 必须保持规则格点坐标
  for (const pt of pts) {
    const jitterX = (random() - 0.5) * 8;
    const jitterY = (random() - 0.5) * 8;
    pt.x = pt.baseX + jitterX;
    pt.y = pt.baseY + jitterY;
  }

  return pts;
}

/**
 * 正三角形网格
 * 偶数行 X 偏移 gap/2，Y 间距 gap * sqrt(3) / 2
 */
function generateTriangleGrid(
  pts: Point[],
  width: number,
  height: number,
  extendX: number,
  extendY: number
): void {
  const gap = config.dotGap;
  const ySpacing = gap * (Math.sqrt(3) / 2);
  const cols = Math.ceil((width + extendX * 2) / gap) + 2;
  const rows = Math.ceil((height + extendY * 2) / ySpacing) + 2;

  for (let row = 0; row < rows; row++) {
    const xOffset = row % 2 === 0 ? 0 : gap / 2;
    for (let col = 0; col < cols; col++) {
      const baseX = col * gap + xOffset - extendX;
      const baseY = row * ySpacing - extendY;
      pts.push({
        x: baseX,
        y: baseY,
        baseX: baseX,
        baseY: baseY,
        radius: config.dotSize,
        targetRadius: config.dotSize,
      });
    }
  }
}
/**
 * 正方形网格
 * 基础 (i * gap, j * gap)
 */
function generateSquareGrid(
  pts: Point[],
  width: number,
  height: number,
  extendX: number,
  extendY: number
): void {
  const gap = config.dotGap;
  const cols = Math.ceil((width + extendX * 2) / gap) + 2;
  const rows = Math.ceil((height + extendY * 2) / gap) + 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const baseX = col * gap - extendX;
      const baseY = row * gap - extendY;
      pts.push({
        x: baseX,
        y: baseY,
        baseX: baseX,
        baseY: baseY,
        radius: config.dotSize,
        targetRadius: config.dotSize,
      });
    }
  }
}

/**

 * 正六边形网格（蜂窝状）
 * 与三角形网格相同的点分布：
 * - 水平间距：gap
 * - 垂直间距：gap * sqrt(3) / 2
 * - 奇数行 X 偏移：gap / 2
 */
function generateHexagonGrid(
  pts: Point[],
  width: number,
  height: number,
  extendX: number,
  extendY: number
): void {
  const gap = config.dotGap;
  const ySpacing = gap * (Math.sqrt(3) / 2);
  const cols = Math.ceil((width + extendX * 2) / gap) + 2;
  const rows = Math.ceil((height + extendY * 2) / ySpacing) + 2;

  for (let row = 0; row < rows; row++) {
    const xOffset = row % 2 === 0 ? 0 : gap / 2;
    for (let col = 0; col < cols; col++) {
      const baseX = col * gap + xOffset - extendX;
      const baseY = row * ySpacing - extendY;
      pts.push({
        x: baseX,
        y: baseY,
        baseX: baseX,
        baseY: baseY,
        radius: config.dotSize,
        targetRadius: config.dotSize,
      });
    }
  }
}


/**
 * 检测当前是否为暗色模式
 */
function checkDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

/**
 * 设置 MutationObserver 监听主题变化
 */
function setupThemeObserver(): void {
  mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class'
      ) {
        isDarkMode = checkDarkMode();
      }
    }
  });

  mutationObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

// ============ Debounce 工具 ============

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => fn(...args), delay);
  };
}

// ============ 渲染逻辑 ============

function drawLines(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  sides: number,
  offsetX: number,
  offsetY: number
): void {
  const gap = config.dotGap;
  const ySpacing = gap * (Math.sqrt(3) / 2);
  
  for (const pt of points) {
    if (sides === 3) {
      drawTriangleLines(ctx, pt, gap, offsetX, offsetY);
    } else if (sides === 4) {
      drawSquareLines(ctx, pt, gap, offsetX, offsetY);
    } else if (sides === 6) {
      drawHexagonLines(ctx, pt, gap, offsetX, offsetY);
    }
  }
}

function drawTriangleLines(
  ctx: CanvasRenderingContext2D,
  pt: Point,
  gap: number,
  offsetX: number,
  offsetY: number
): void {
  const x = pt.baseX + PADDING + offsetX;
  const y = pt.baseY + PADDING + offsetY;
  const ySpacing = gap * (Math.sqrt(3) / 2);
  
  // 三角形网格的6个方向连线
  const directions = [
    { dx: gap, dy: 0 },                          // 右
    { dx: gap / 2, dy: ySpacing },               // 右下
    { dx: -gap / 2, dy: ySpacing },              // 左下
  ];
  
  for (const dir of directions) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dir.dx, y + dir.dy);
    ctx.stroke();
  }
}

function drawSquareLines(
  ctx: CanvasRenderingContext2D,
  pt: Point,
  gap: number,
  offsetX: number,
  offsetY: number
): void {
  const x = pt.baseX + PADDING + offsetX;
  const y = pt.baseY + PADDING + offsetY;
  
  // 正方形网格的2个方向连线（只画右和下，避免重复）
  const directions = [
    { dx: gap, dy: 0 },   // 右
    { dx: 0, dy: gap },   // 下
  ];
  
  for (const dir of directions) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dir.dx, y + dir.dy);
    ctx.stroke();
  }
}

function drawHexagonLines(
  ctx: CanvasRenderingContext2D,
  pt: Point,
  gap: number,
  offsetX: number,
  offsetY: number
): void {
  const x = pt.baseX + PADDING + offsetX;
  const y = pt.baseY + PADDING + offsetY;
  const ySpacing = gap * (Math.sqrt(3) / 2);
  
  // 根据列位置奇偶性决定连线方向，形成蜂窝状六边形网格
  // 偶数列：向右 + 右下；奇数列：向右 + 左下
  const col = Math.round(pt.baseX / gap);
  const isEvenCol = col % 2 === 0;
  
  // 所有列都绘制水平向右的线
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + gap, y);
  ctx.stroke();
  
  // 根据列奇偶性绘制对角线
  ctx.beginPath();
  ctx.moveTo(x, y);
  if (isEvenCol) {
    // 偶数列：右下
    ctx.lineTo(x + gap / 2, y + ySpacing);
  } else {
    // 奇数列：左下
    ctx.lineTo(x - gap / 2, y + ySpacing);
  }
  ctx.stroke();
}

/**
 * 动画帧更新
 */
function animate(): void {
  if (!ctx || !canvas) return;

  // 平滑视差偏移（缓动）
  const easing = 0.08;
  animation.offsetX += (mouse.x - animation.offsetX) * easing;
  animation.offsetY += (mouse.y - animation.offsetY) * easing;

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 获取 footer 元素位置，计算裁剪区域
const footer = document.querySelector('footer');
const footerTop = footer ? footer.getBoundingClientRect().top + PADDING : canvas.height;

// 设置裁剪区域（只在 footer 之上绘制，不裁剪 header）
ctx.save();
ctx.beginPath();
ctx.rect(0, 0, canvas.width, Math.max(0, footerTop));
ctx.clip();

  // 设置颜色
  ctx.fillStyle = isDarkMode ? COLORS.dark : COLORS.light;

  // 计算中心偏移（视差效果）
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const parallaxX = (animation.offsetX - centerX) * -0.1;
  const parallaxY = (animation.offsetY - centerY) * -0.1;

  // 限制偏移范围
  const clampedX = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, parallaxX));
  const clampedY = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, parallaxY));

  // 找到最近的点（使用与渲染相同的坐标逻辑）
  let minDist = Infinity;
  let nearestIndex = -1;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const screenX = (config.showLines ? pt.baseX : pt.x) + PADDING + clampedX;
    const screenY = (config.showLines ? pt.baseY : pt.y) + PADDING + clampedY;
    const dist = Math.hypot(mouse.x - screenX, mouse.y - screenY);

    if (dist < minDist) {
      minDist = dist;
      nearestIndex = i;
    }
  }

  // 更新点半径（平滑过渡）
  const transitionSpeed = TRANSITION_DURATION * 0.1;
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    pt.targetRadius = i === nearestIndex ? config.dotSizeHighlight : config.dotSize;
    pt.radius += (pt.targetRadius - pt.radius) * transitionSpeed;
  }

  // 绘制所有点
  // showLines=false 时使用 jitter 后坐标 (x/y)，showLines=true 时使用规则坐标 (baseX/baseY) 与连线对齐
  for (const pt of points) {
    const x = (config.showLines ? pt.baseX : pt.x) + PADDING + clampedX;
    const y = (config.showLines ? pt.baseY : pt.y) + PADDING + clampedY;

    ctx.beginPath();
    ctx.arc(x, y, pt.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 绘制连线（调试用）
  if (config.showLines) {
    ctx.strokeStyle = isDarkMode ? COLORS.dark : COLORS.light;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    
    drawLines(ctx, points, currentSides, clampedX, clampedY);
    
    ctx.globalAlpha = 1;
  }

  // 恢复裁剪区域
  ctx.restore();

  rafId = requestAnimationFrame(animate);
}

/**
 * 处理窗口大小变化
 */
function handleResize(): void {
  if (!canvas) return;

  const width = window.innerWidth + PADDING * 2;
  const height = window.innerHeight + PADDING * 2;

  canvas.width = width;
  canvas.height = height;

  // 重新生成点阵
  const seed = new Date().toDateString();
  const random = createSeededRandom(seed);
  const sides = choosePolygonSides(random);
  currentSides = sides;
  points = generatePoints(sides, width, height, random);
}

/**
 * 根据随机值或配置选择多边形边数
 * 支持通过 URL 参数 bgPolygonSides 或全局变量 window.bgPolygonSides 固定边数
 */
function choosePolygonSides(random: () => number): number {
  // 从 URL 参数或全局变量获取固定边数
  const urlParam = new URLSearchParams(window.location.search).get('bgPolygonSides');
  const globalVar = (window as { bgPolygonSides?: unknown }).bgPolygonSides;
  const fixedSides = urlParam ?? (typeof globalVar === 'string' || typeof globalVar === 'number' ? String(globalVar) : null);

  if (fixedSides) {
    const parsed = parseInt(fixedSides, 10);
    if (config.polygonSides.includes(parsed)) {
      return parsed;
    }
  }

  // 从配置的多边形边数数组中均匀随机选取
  const sides = config.polygonSides;
  const index = Math.floor(random() * sides.length);
  return sides[index];
}

/**
 * 处理鼠标移动
 */
function handleMouseMove(e: MouseEvent): void {
  mouse.x = e.clientX + PADDING;
  mouse.y = e.clientY + PADDING;
}

// ============ 公共 API ============

/**
 * 初始化背景
 * @param canvasElement Canvas 元素
 * @returns 清理函数
 */
/**
 * 更新配置并重新生成背景
 * @param newConfig 新配置（部分）
 */
export function updateConfig(newConfig: Partial<BgConfig>): void {
  config = { ...config, ...newConfig };
  handleResize();
}

export function initBackground(canvasElement: HTMLCanvasElement): () => void {
  // 从全局变量读取配置
  if ((window as unknown as { __BG_CONFIG__?: Partial<BgConfig> }).__BG_CONFIG__) {
    config = { ...DEFAULT_CONFIG, ...(window as unknown as { __BG_CONFIG__?: Partial<BgConfig> }).__BG_CONFIG__ };
  }

  canvas = canvasElement;
  ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('DotBackground: 无法获取 Canvas 2D 上下文');
    return () => {};
  }

  // 初始化状态
  isDarkMode = checkDarkMode();
  mouse = { x: window.innerWidth / 2 + PADDING, y: window.innerHeight / 2 + PADDING };
  animation = { offsetX: mouse.x, offsetY: mouse.y };

  // 设置 Canvas 尺寸
  const width = window.innerWidth + PADDING * 2;
  const height = window.innerHeight + PADDING * 2;
  canvas.width = width;
  canvas.height = height;

  // 初始 transform
  canvas.style.transform = `translate(${-PADDING}px, ${-PADDING}px)`;
  canvas.style.zIndex = '-1';

  // 生成点阵
  const seed = new Date().toDateString();
  const random = createSeededRandom(seed);
  const sides = choosePolygonSides(random);
  currentSides = sides;
  points = generatePoints(sides, width, height, random);

  // 设置主题监听
  setupThemeObserver();

  // 事件监听
  const debouncedResize = debounce(handleResize, DEBOUNCE_DELAY);
  window.addEventListener('resize', debouncedResize);
  window.addEventListener('mousemove', handleMouseMove);

  // 启动动画
  rafId = requestAnimationFrame(animate);

  // 返回清理函数
  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    window.removeEventListener('resize', debouncedResize);
    window.removeEventListener('mousemove', handleMouseMove);
  };
}

/**
 * 销毁背景（全局清理）
 */
export function destroyBackground(): void {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }

  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }

  canvas = null;
  ctx = null;
  points = [];
  mouse = { x: 0, y: 0 };
  animation = { offsetX: 0, offsetY: 0 };
}
