# 诗云 · 黑金宇宙歌剧

一个可搜索、可漫游、可阅读、可展示关系网络的中国古典诗歌三维宇宙。黑金吸积盘串联六道时间星环；访客可以按朝代筛选、搜索诗人与诗作、进入阅读和关系网络，也可以开启自动巡游。

## Experience

- 17,396 首可追溯古典诗词，另含少量近现代作品的题名与主题元数据
- 诗人星域、诗作阅读、来源明确的文学关系和自动巡游
- 桌面电影化 WebGL 场景与移动端完整交互
- WebGL 不可用时自动切换为复用同一状态的 CSS 静态星图
- `Escape` 层级返回，`H` 隐藏或恢复界面

## Commands

- `npm ci --legacy-peer-deps`
- `npm run dev`
- `npm test`
- `npm run typecheck`
- `npm run data:verify`
- `npm run build`
- `npm run budget`
- `npm run test:e2e`

## Data

古典诗词来自 `chinese-poetry/chinese-poetry` 的固定 MIT 提交；详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。运行时数据位于 `public/data`，按清单和朝代分片加载。近现代作品不包含未经明确授权的全文。

## Architecture

React reducer 维护总览、诗人、诗作、关系与巡游的唯一状态。React Three Fiber 场景按图层组织；搜索索引由 Web Worker 延迟加载，数据路径统一使用 Vite 的 GitHub Pages base URL。

## Deploy

合并到 `main` 后，由 `.github/workflows/deploy.yml` 自动验证并发布到 <https://6789-6.github.io/poem-galaxy/>。
