# Microscope Imaging Calculator (Svelte + Vite)

专业的显微成像参数计算工具，零后端、全静态页面，可直接发布到 GitHub Pages。

## 功能
- 输入：传感器尺寸/像素、物镜倍率与 NA、视场数 FN、耦合镜倍率、筒长/管镜、波长、显示器参数。
- 输出：光学分辨率 (Rayleigh)、物方像素尺寸、采样评估（欠采样/合适/过采样）、总放大率、物方视场、所需像素尺寸(奈奎斯特)、最佳阵列大小估算、显示放大率等。
- 可视化：FN 圆与传感器在中间像面的投影矩形。

参考资料：
- MicroscopyU: Matching Camera to Microscope Resolution — https://www.microscopyu.com/tutorials/matching-camera-to-microscope-resolution
- MV Audio Labs: Optical System Calculator — https://www.mvaudiolabs.com/services/optical-system-calculator/
- Edmund Optics: Imaging System Parameter Calculator — https://www.edmundoptics.com/knowledge-center/tech-tools/imaging-system-parameter-calculator/

## 开发
```bash
# 进入项目根目录后
cd cameraCalculate
npm install
npm run dev
```
访问提示的本地地址（默认 http://localhost:5173/）。

## 构建
```bash
npm run build
npm run preview
```

## 部署到 GitHub Pages
- 默认使用 `main` 分支触发工作流，自动构建并发布到 `gh-pages` 分支。
- 需确保仓库名为 `cameraCalculate` 或者在 `vite.config.ts` 中调整 `base`（如 `base: '/你的仓库名/'`）。
- 推送到 `main`：
```bash
git add .
git commit -m "deploy"
git push origin main
```
Actions 完成后，在仓库 Settings → Pages 指向 `gh-pages` 分支根目录。

## 结构
- `src/lib/calculations.ts`：核心计算引擎
- `src/App.svelte`：主界面与可视化
- `src/data/sensors.ts`：常见传感器预设

## 许可证
MIT 