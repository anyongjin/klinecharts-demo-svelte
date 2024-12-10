# KlineCharts-demo-svelte
这是一个示例项目，使用KlineCharts(10.0.0-alpha1)绘制金融K线图，界面UI从[KLineChart Pro](https://pro.klinecharts.com/getting-started.html)改写(KLineChart Pro使用Solid-js，本项目改写为svelte)  
本项目使用[sveltekit](https://svelte.dev/)  
如需vue版本，请参考[klinechart-ui-demo](https://github.com/anyongjin/klinechart-ui-demo)（此版本基于KlineChart 9.8.10）

# 如何使用
由于交易界面UI要求的定制性一般比较高，将此项目打包为package不太适合自由修改。  
所以建议直接clone本项目，提取需要的部分，自由修改页面组件和UI  

## 开始预览
```bash
yarn install
yarn dev
```

## 开发笔记
** 国际化 **  
使用inlang的国际化[插件](https://inlang.com/m/dxnzrydw/paraglide-sveltekit-i18n/getting-started)
1. 在 project.inlang/settings.json 中添加语言标签，并在 messages 文件夹下添加语言文件。
5. 在需要使用语言标签的地方，使用:
```typescript
import * as m from '$lib/paraglide/messages.js'
m.hello()
m['hello']()
```

** 注册新指标 **  
在 src/lib/coms.ts 中添加新指标的字段和默认参数。

** 编译为静态资源 **  
sveltekit支持编译静态资源，只需将svelte.config.js中的`adapter-auto`改为`adapter-static`，然后执行`npm run build`，即可在dist目录下生成静态资源。

** 数据来源  **  
为演示需要，本项目固定使用KlineChart的假数据，如需使用真实数据，请在src/lib/mydatafeed.ts中取消注释改为自己的接口

** 云端指标 **  
本项目原生支持云端指标加载和显示，后端需提供`/kline/all_inds`和`/kline/calc_ind`接口，具体参数请参考`src/lib/indicators/cloudInds.ts`

## TODO
* 覆盖物从localstorage中恢复
* textBox多行文本边界计算不正确
* 滚动条样式未全局生效

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
