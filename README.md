# 诗云 · 中国诗歌三维星系

一个参考视频《诗云》效果设计的 PC 端沉浸式诗歌宇宙 Web App 原型。项目目标不是普通诗词阅读器，而是“可漫游、可检索、可阅读、可展示关系网络的中国诗歌三维宇宙”。

## 已实现

- 全屏 Three.js / React Three Fiber 三维星系
- 150,000 个程序化诗歌星点
- 36,000 个星云粒子
- GPU 自定义点云 shader：支持每个星点独立大小、闪烁和朝代筛选衰减
- 诗人主星、发光恒星、朝代颜色分区
- 搜索诗人、诗名、意象，并驱动镜头飞入
- 朝代筛选：先秦、汉魏六朝、唐、宋、元明清、近现代
- 点击诗人主星后镜头飞行定位
- 右侧诗人/诗作详情面板
- 诗人关系网络模式与弧形关系航线
- 沉浸式读诗模式与诗句悬浮层
- GitHub Pages 自动部署工作流

## 当前优化重点

本项目已根据视频级优化研究报告完成第一批结构性改造：

1. 将主星尘层从 `PointsMaterial` 切换为 GPU shader，修复 `size` attribute 原本未被真正消费的问题。
2. 朝代筛选不再逐点回写 150,000 个 color attribute，而是通过 shader uniform mask 在 GPU 端完成亮暗衰减。
3. 关系航线构建增加缓存与 `poetMap`，避免关系模式反复 `find()` 和重复构建 typed array。
4. 文档已同步到实际粒子规模，避免“文档即 bug”。

## 技术栈

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- 自定义 GLSL ShaderMaterial
- CSS Glassmorphism / HUD UI

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开终端显示的地址，通常是：

```txt
http://localhost:5173
```

## 打包

```bash
npm run build
npm run preview
```

## 部署到 GitHub Pages

1. 进入仓库 Settings → Pages。
2. Source 选择 GitHub Actions。
3. 推送到 `main` 分支后，Actions 会自动构建并发布。

线上地址通常为：

```txt
https://6789-6.github.io/poem-galaxy/
```

## 后续升级方向

- 继续拆分 `GalaxyScene.tsx` 为星尘层、星云层、主星层、标签层、相机层和效果层。
- 引入 selective bloom 与读诗模式 DOF，强化视频里的高亮主星和镜头纵深感。
- 接入真实古诗词 JSON 数据集。
- 将诗歌文本通过 embedding / TF-IDF / 主题模型映射到三维坐标。
- 使用 Web Workers / IndexedDB / 分片 JSON，支持更大规模诗歌数据。
- 诗人关系改成真实社交、师承、唱和、引用网络。
- 增加时间轴飞行、朝代星云聚类、诗体过滤、格律分析。
