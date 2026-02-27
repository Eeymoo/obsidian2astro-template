# fix-bg-issues — Issues

## 2025-02-27 jitter 坐标未使用问题

### 问题现象
- `showLines=false` 时点无抖动效果
- jitter 计算的 `x/y` 坐标从未被使用

### 根因
在 `animate()` 函数中，点渲染和最近点计算都硬编码使用 `baseX/baseY`：
```typescript
const screenX = pt.baseX + PADDING + clampedX;  // 始终用 baseX
const x = pt.baseX + PADDING + clampedX;       // 渲染也用 baseX
```

导致 `generatePoints` 中的 jitter 计算完全无效。

### 修复
1. 点渲染：根据 `config.showLines` 选择坐标
2. 最近点计算：同样根据 `showLines` 选择坐标
```typescript
const x = (config.showLines ? pt.baseX : pt.x) + PADDING + clampedX;
const y = (config.showLines ? pt.baseY : pt.y) + PADDING + clampedY;
```

### 效果
- `showLines=false`：点使用 jitter 后坐标，有自然抖动
- `showLines=true`：点使用规则坐标，与连线完美对齐

## 2026-02-27: DotBackground 视觉验证结果

### 1. 四边形网格 (sides=4)
- **是否仍存在问题**：否，表现正常。
- **具体表现**：开启 `showLines=true` 时，连线形成规则的正方形网格，无断裂、无错位，点与线完美对齐。
- **复现步骤**：
  1. 访问 `http://127.0.0.1:4321/?bgPolygonSides=4`
  2. 在右下角“背景调试面板”中，勾选“显示连线（调试）”
- **受影响配置**：`polygonSides=4`, `showLines=true`

### 2. 六边形网格 (sides=6)
- **是否仍存在问题**：是，连线逻辑错误。
- **具体表现**：
  - 开启 `showLines=true` 时，连线并没有形成预期的“蜂窝/六边形网格”，而是形成了密集的“正三角形网格”。
  - 代码层面，`generateHexagonGrid` 生成的点阵与三角形网格完全相同，且 `drawHexagonLines` 的连线逻辑（右、右下、左下）导致每个点都连接了6个相邻点，从而画出了三角形网格。真正的蜂窝网格中，每个顶点应该只连接3个相邻点。
  - 关闭 `showLines=false` 时，点阵的 jitter 效果自然，没有夸张的错位，表现良好。
- **复现步骤**：
  1. 访问 `http://127.0.0.1:4321/?bgPolygonSides=6`
  2. 在右下角“背景调试面板”中，勾选“显示连线（调试）”观察连线形状（呈现三角形网格）。
  3. 取消勾选“显示连线（调试）”观察点阵（jitter 效果正常）。
- **受影响配置**：`polygonSides=6`, `showLines=true`
