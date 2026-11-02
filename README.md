# 大肥鱼 · 个人主页

一个零依赖的静态个人主页模板：纯 HTML + CSS + 原生 JS，深浅色切换、滚动动效、响应式布局，
可以直接放到 GitHub Pages 上线，也可以顺手学一下前端。

## 目录结构

```
.
├── index.html              # 页面内容（要改的东西 90% 在这里）
├── assets/
│   ├── css/style.css       # 样式（配色、间距、动画）
│   ├── js/main.js          # 交互 + GitHub 仓库自动同步
│   └── img/
│       ├── avatar.svg      # 头像（换成自己的照片）
│       └── favicon.svg     # 浏览器标签小图标
├── .nojekyll               # 告诉 GitHub Pages 不要用 Jekyll 处理
├── preview/                # 预览截图（只是给你自己看的，上传前可以删掉）
└── README.md
```

## 项目区：自动同步 GitHub（已配置好）

项目卡片不是手写的，是页面打开时从 GitHub 接口读出来的，所以在 GitHub 上新建仓库、改一句仓库简介，
主页会自动跟着变。相关配置在 `assets/js/main.js` 第 9 段开头：

```js
var GH_USER  = 'Yu-Suki';              // 你的 GitHub 用户名
var GH_LIMIT = 6;                      // 最多显示几个仓库
var GH_HIDE  = ['Yu-Suki.github.io'];  // 不想展示的仓库名（主页仓库自己就别展示了）
```

规则和细节：

- 只读**公开**仓库；`fork` 的和 `archived`（已归档）的会自动跳过；
- 排序按最近推送时间，所以「最近在做的」排在最前面；
- 卡片上的语言色点、star 数、topics 都是自动的；
- 仓库没写 Description 时，卡片会显示一句提示，去仓库补上就会自动出现；
- 结果缓存在浏览器 `localStorage` 里 1 小时，所以不会每次都打接口（GitHub 未登录接口限制 60 次/小时/IP）；
- 接口读不到时（断网、限流），显示 `index.html` 里那张兜底卡片，页面不会空掉；
- 首屏那个「N 个开源项目」小标签和「关于我」里的统计数字也会自动更新。

想改成纯手写（完全自己控制内容）：把 `index.html` 里 `id="repoGrid"` 那个 div 的内容换成你手写的
`<article class="work-card">`，再把 `main.js` 里 `loadRepos();` 这一行删掉即可。

## 本地预览

直接双击 `index.html` 就能看。或者起一个本地服务器（可选，更接近线上环境）：

```bash
# 有 Python
python -m http.server 8000
# 有 Node
npx serve .
```

然后打开 http://localhost:8000。

## 必须改的 14 处

`index.html` 里搜 `✏️` 就能找到全部位置，按顺序：

| # | 位置 | 改什么 |
|---|------|--------|
| 1 | `<head>` | 标题、描述、作者 |
| 2 | 导航栏 | 站点名（左上角） |
| 3 | 首屏 | 身份小标签（现居 / 开放状态） |
| 4 | 首屏 | 你的名字 |
| 5 | 首屏 | 自我介绍两三句 |
| 6 | 首屏 | GitHub / 邮箱 / X 链接 |
| 7 | 首屏 | 头像图片地址 |
| 8 | 关于 | 你的故事 + 4 条要点 |
| 9 | 技能 | 三组技能标签 |
| 10 | 项目 | 自动读 GitHub 仓库，不用手改；配置在 `assets/js/main.js` 顶部 |
| 11 | 经历 | 时间线，从近到远 |
| 12 | 图集 | 4 张图 + 说明 |
| 13 | 联系 | 邮箱（`href` 和 `data-mail` 两处都要改） |
| 14 | 页脚 | 署名 + 源码链接 |

`assets/js/main.js` 里的 `roles` 数组是首屏轮播的身份词，也可以改成你自己的。
`assets/css/style.css` 顶部 `[data-theme="dark"]` / `[data-theme="light"]` 里是全部配色变量。

## 放自己的东西

- **图片**：放进 `assets/img/`，用相对路径引用 `<img src="assets/img/photo1.jpg" alt="说明">`
- **PDF / 简历**：新建 `assets/files/` 放进去，链接 `<a href="assets/files/resume.pdf" download>下载简历</a>`
- **视频**：几十 MB 以下可以直接 `<video src="assets/files/demo.mp4" controls></video>`；再大就传到 B 站 / YouTube 再用 `<iframe>` 嵌入
- **注意**：仓库公开后上面所有文件都是公开的，不要放证件照原图、密码、`.env`、身份证之类的隐私文件
- 单文件超过 100 MB 会被 GitHub 拒绝，超过 50 MB 会警告；大文件建议用 Git LFS 或外部图床

## 发布到 GitHub Pages

> 这台电脑现在**还没装 Git**，第一次上线建议直接用网页上传（下面 1–4 步）；想用命令行的，先装
> [Git for Windows](https://git-scm.com/download/win)。

1. 在 GitHub 新建仓库，名字必须是 **`Yu-Suki.github.io`**，设为 Public。
2. 把本目录里的文件上传到仓库根目录（`index.html` 必须在最外层，不能包在文件夹里）。
3. 打开仓库 `Settings → Pages`，`Build and deployment` 的 Source 选 **Deploy from a branch**，
   Branch 选 **main**、目录选 **/ (root)**，点 Save。
4. 等 1～3 分钟，访问 `https://yu-suki.github.io`。

装了 Git 之后（在项目目录里执行）：

```bash
git init
git add .
git commit -m "init: 个人主页"
git branch -M main
git remote add origin https://github.com/Yu-Suki/Yu-Suki.github.io.git
git push -u origin main
```

之后每次改完，三条命令更新：

```bash
git add .
git commit -m "update: 换了头像"
git push
```

## 常见问题

- **404**：仓库名没写对（必须 `用户名.github.io`），或 `index.html` 不在根目录，或还没等够时间。
- **样式没生效**：路径大小写不对。Linux 服务器区分大小写，`Style.css` ≠ `style.css`。
- **改了没变化**：等 1 分钟；浏览器强制刷新 `Ctrl + F5`。
- **图片不显示**：文件名带中文或空格容易出问题，改成英文小写加连字符，比如 `city-night.jpg`。
- **仓库必须是 Public**：私有仓库的 Pages 需要付费方案。
- **项目卡片没出现 / 只有兜底卡片**：仓库是 Private，或 GitHub 接口被限流（未登录 60 次/小时/IP），
  换个网络或等一小时；卡片上显示「还没写简介」就是仓库 Description 为空。

## 可选进阶

- **自定义域名**：买个域名 → 仓库 `Settings → Pages → Custom domain` 填进去 → 去域名商加 CNAME 记录指向 `你的用户名.github.io`。
- **项目主页**：如果不想占用户名，也可以建普通仓库，在 Pages 里选分支，地址会变成 `用户名.github.io/仓库名`。
- **看访问量**：贴一个不蒜子计数或 Google Analytics 的统计代码进去。
- **换成现成主题**：Jekyll 的 `minima`、`chirpy`，或 Hugo 的 `PaperMod`、`Academic Pages`，适合想写博客的人。
