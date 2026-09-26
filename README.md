# Junyan Liu — 个人学术主页

极简黑白风格的静态网站，纯 HTML/CSS/JS，无需构建工具，部署在 GitHub Pages 上。

## 文件结构

```
├── index.html                 主页（About / Education / Honors / Research /
│                               Teaching Experience / Projects / Publications /
│                               Skills / Contact）
├── README.md
├── assets/
│   ├── style.css               全站共用样式（颜色、字体、timeline、pub-list 等）
│   ├── script.js                移动端菜单折叠 + 页脚年份自动更新
│   ├── photo.jpg                你的照片（需自己添加，见下文）
│   ├── cv.pdf                   你的简历 PDF（需自己添加，见下文）
│   └── robotic-budding-poster.pdf   Replicate 论文的会议 poster PDF
└── replicate/                  "Robotic Budding"（自复制模块机器人）项目独立页面
    ├── index.html
    ├── style.css                该页面专属的额外样式（论文标题、图表网格等）
    └── images/
        └── robotic-budding/     该项目的所有图片 + 视频，文件名与来源保持一致
```

## 本地预览

```bash
python3 -m http.server 8000
```

然后浏览器打开 `http://localhost:8000`。**不要**直接双击用 `file://` 方式打开——嵌入视频等在 `file://` 下可能显示异常，用本地服务器预览效果才和 GitHub Pages 上线后一致。

## 更新内容

- **Education / Honors / Teaching Experience / Projects / Skills / Contact**：直接在 `index.html` 里找到对应 `<section>`，改文字即可，结构不用动。
- **Research**：每条经历是一个 `.timeline > li`，里面的 `.timeline-media` 是图片/视频占位框——想换图，把 `<span>...</span>` 换成 `<img src="assets/xxx.jpg" alt="...">`（图片放进 `assets/`）。
- **Publications**：`pub-list` 里每篇论文一个 `<li>`，标题、作者、venue 链接都在里面，复制现有结构加新论文即可。
- **Replicate 项目页**（`replicate/index.html`）：图片/视频都在 `replicate/images/robotic-budding/` 下，引用路径是相对路径 `images/robotic-budding/xxx.webp`，所以这个子文件夹必须和 `replicate/index.html` 放在同一层，不能挪位置。

## 还没做完的事

- [ ] 把照片重命名为 `photo.jpg` 放进 `assets/`，然后在 `index.html` 的 `.portrait` 里取消注释 `<img>` 那行，删掉旁边的占位字母。
- [ ] 把简历 PDF 重命名为 `cv.pdf` 放进 `assets/`，"Download CV" 按钮就能直接工作。
- [ ] Skills 部分的 "Languages" 那一行还是占位文字，需要自己填。
- [ ] About 里的自我介绍段落是草稿（标了 `[DRAFT]`），确认或修改后记得删掉这个标记。

## 部署到 GitHub Pages

1. GitHub 上新建仓库，命名为 `jl7293.github.io`（必须和账号名完全一致，才能用 `https://jl7293.github.io` 这个域名）。
2. 把本文件夹里的所有内容（`index.html`、`README.md`、`assets/`、`replicate/`）上传到该仓库根目录（网页拖拽上传或 `git push` 都可以）。
3. 仓库 **Settings → Pages** → Source 选 **Deploy from a branch**，Branch 选 `main`，目录选 `/ (root)`，保存。
4. 等 1-2 分钟，页面会提示部署完成，地址是 `https://jl7293.github.io`。

之后每次改完内容重新 push 到 `main`，网站会在一两分钟内自动更新。
