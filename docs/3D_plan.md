# 3D 情绪分布图完整开发计划

## 现状分析

### 现有 2D 情绪分布图

- 使用 SVG 实现的二维散点图
- X 轴表示 Valence（效价）：从负到正
- Y 轴表示 Dominance（支配力）：从被动到主动
- 情绪数据范围：valence 和 dominance 为-1 到 1
- 当前 VAD 状态显示为红色圆点，范围为 0-100，需要映射到-1 到 1
- 数据来源：`data/emotion_vad.json`

### 3D 需求分析

- 需要创建一个 3D 场景，可视化 VAD 三维空间中的情绪分布
- 需要使用`@react-three/fiber`和`@react-three/drei`
- 使用`pmndrs/leva`进行交互式参数调整
- 数据来源：`data/vad3d.json`

### 项目现状

- 项目基于 React + TypeScript + Vite
- 未安装所需的 3D 库：`@react-three/fiber`、`@react-three/drei`、`@pmndrs/leva`
- 主组件为`HormoneEmotionSimulator.tsx`，其中集成了 2D 情绪分布图

## 开发计划（根据所有需求更新）

### 1. 环境准备

- 安装必要的依赖包：
  ```bash
  npm install three @react-three/fiber @react-three/drei leva
  ```

### 2. 创建 3D 情绪分布图组件

- 创建新组件：`src/components/Emotion3DChart.tsx`
- 实现功能：
  - 加载`data/vad3d.json`中的情绪数据
  - 在 3D 空间中绘制情绪点（使用简洁、轻量的 3D 形状）
  - 显示当前 VAD 状态（使用不同颜色/形状的 3D 对象）
  - 添加坐标轴和标签
  - 集成 Leva GUI 进行交互式参数调整
  - 支持鼠标交互（旋转、缩放等）

### 3. 组件设计细节

- **坐标系统**：
  - X 轴：Valence（效价）从-1 到 1
  - Y 轴：Arousal（唤醒度）从-1 到 1
  - Z 轴：Dominance（支配力）从-1 到 1
- **可视化元素**：
  - 情绪点：使用简洁的球体表示
  - 当前状态：使用较大的球体或不同颜色表示
  - 坐标轴：清晰标记三个维度
- **交互功能**：
  - 支持鼠标交互（旋转、缩放等）
  - 使用 Leva 添加控制面板，可调整：
    - 各激素的 force
    - 暂停/开始模拟
    - 是否显示坐标轴
    - 当前状态点的样式
- **样式和动画**：
  - 使用简洁、轻量的风格
  - 添加平滑的过渡动画

### 4. 实现视图切换功能

- 修改`HormoneEmotionSimulator.tsx`组件：
  - 在右上角添加 2D/3D 切换按钮
  - 添加状态管理来控制当前显示的视图（2D 或 3D）
  - 根据状态条件渲染 2D 或 3D 情绪分布图

### 5. 优化和改进

- 添加响应式设计，确保在不同屏幕尺寸上正常显示
- 优化性能，避免不必要的重渲染
- 添加加载状态和错误处理
- 添加平滑的动画效果，使状态变化更自然

## 实施步骤

1. 安装依赖包
2. 创建`Emotion3DChart`组件
3. 修改`HormoneEmotionSimulator`组件，添加视图切换功能
4. 测试和优化

这个计划将实现一个现代化的 3D 情绪分布图，同时保持与现有 2D 版本的兼容性，并提供流畅的切换体验。
