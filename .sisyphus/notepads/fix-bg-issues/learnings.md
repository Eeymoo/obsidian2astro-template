# fix-bg-issues — Learnings

## 2025-02-27 四边形/六边形网格问题修复

### 根本原因
在 `generatePoints` 函数的 jitter 循环中，错误地将 jitter 后的坐标赋给 `baseX/baseY`：
```typescript
// 错误代码
pt.x += jitterX;
pt.y += jitterY;
pt.baseX = pt.x;  // BUG: 把 jitter 后的坐标赋给 baseX
pt.baseY = pt.y;  // BUG: 同上
```

这导致连线（drawLines）使用的 `baseX/baseY` 也带有 jitter，破坏了网格几何结构。

### 修复方案
1. 在网格生成函数（generateTriangleGrid/generateSquareGrid/generateHexagonGrid）中，直接设置 `baseX/baseY` 为规则网格坐标
2. 在 generatePoints 的 jitter 循环中，只修改 `x/y`，不修改 `baseX/baseY`：
```typescript
// 正确代码
pt.x = pt.baseX + jitterX;
pt.y = pt.baseY + jitterY;
// baseX/baseY 保持不变
```

### 关键约定
- `baseX/baseY`: 规则格点坐标（未经过 jitter），用于连线绘制和几何验证
- `x/y`: 可带有 jitter 的显示坐标，用于点的实际渲染

---

## 2025-02-27 渲染坐标选择逻辑修复

### 问题
jitter 计算的 `x/y` 坐标在渲染时未被使用，导致：
- `showLines=false` 时点无抖动效果
- 点渲染和连线始终基于规则网格

### 修复
在 `animate()` 中根据 `config.showLines` 选择坐标：
```typescript
const x = (config.showLines ? pt.baseX : pt.x) + PADDING + clampedX;
const y = (config.showLines ? pt.baseY : pt.y) + PADDING + clampedY;
```

### 渲染行为
| showLines | 点坐标 | 效果 |
|-----------|--------|------|
| false     | x/y    | 自然抖动 |
| true      | baseX/baseY | 与连线对齐 |

## 2026-02-27: DotBackground 视觉验证方法与标准

### 验证方法
- 使用 Playwright 自动化脚本启动无头浏览器，访问本地 dev server。
- 通过 URL 参数 `?bgPolygonSides=n` 强制指定多边形边数。
- 通过 Playwright 模拟点击调试面板的 `#show-lines` checkbox 来切换连线显示状态。
- 截图保存为证据，并使用视觉分析工具（或肉眼）检查网格的几何形状、连线连续性以及点线对齐情况。

### 通过标准
- **四边形 (sides=4)**：连线必须形成纯粹的正方形网格（仅包含水平和垂直线），不能有对角线，点必须位于十字交叉处。
- **六边形 (sides=6)**：连线必须形成蜂窝状（Honeycomb）网格，即每个顶点只连接3条线，形成正六边形空洞。如果形成的是每个顶点连接6条线的正三角形网格，则视为不符合预期。
- **Jitter 效果**：在关闭连线时，点阵应呈现轻微的随机偏移，打破死板的几何感，但不能偏移过大导致网格结构无法辨认。

## 2026-02-27 六边形网格连线修复

### 问题根因
`drawHexagonLines` 原实现从每个顶点绘制3条线（右、右下、左下），这形成了三角形网格而非蜂窝网格。

### 解决方案
使用列位置奇偶性选择性绘制连线：
- 偶数列：绘制向右 + 右下对角线
- 奇数列：绘制向右 + 左下对角线

通过 `Math.round(pt.baseX / gap) % 2 === 0` 判断列奇偶性。

### 技术要点
1. 所有点都绘制水平向右的线（连接同行相邻点）
2. 对角线方向根据列位置交替变化
3. 这种交替模式自然形成六边形单元格

### 文件
- `src/scripts/dot-background.ts` - `drawHexagonLines` 函数
