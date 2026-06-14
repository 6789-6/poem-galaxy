# 诗云 · 中国诗歌三维星系

一个参考视频《诗云》效果设计的 PC 端沉浸式诗歌宇宙 Web App 原型。

## 已实现

- 全屏 Three.js 三维星系
- 82,000 个程序化诗歌星点
- 16,000 个星云粒子
- 诗人主星、发光恒星、朝代颜色分区
- 搜索诗人、诗名、意象
- 朝代筛选：先秦、汉魏六朝、唐、宋、元明清、近现代
- 点击诗人主星后镜头飞行定位
- 右侧诗人/诗作详情面板
- 诗人关系网络模式
- 沉浸式读诗模式
- GitHub Pages 自动部署工作流

## 技术栈

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- CSS Glassmorphism UI

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

1. 在 GitHub 新建仓库，例如 `poem-galaxy`。
2. 上传本项目全部文件。
3. 进入仓库 Settings → Pages。
4. Source 选择 GitHub Actions。
5. 推送到 `main` 分支后，Actions 会自动构建并发布。

## 后续升级方向

- 接入真实古诗词 JSON 数据集。
- 将诗歌文本通过 embedding / TF-IDF / 主题模型映射到三维坐标。
- 使用 Web Workers 生成百万级星点，避免主线程卡顿。
- 诗人关系改成真实社交、师承、唱和、引用网络。
- 增加时间轴飞行、朝代星云聚类、诗体过滤、格律分析。
- 引入后端索引，支持 90 万首诗全文检索。
