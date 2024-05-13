import { defineConfig } from 'dumi';

export default defineConfig({
  base: '/dumi',
  publicPath: '/dumi/',
  favicons: ['/dumi/favicon.ico'],
  themeConfig: {
    name: 'React',
    logo:'/dumi/favicon.ico',
    github: 'https://github.com/Leon-Amazing',
    title: 'React',
    description: "Leon's library",
    actions: {
      'zh-CN': [
        {
          type: 'primary',
          text: '快速上手',
          link: '/basic'
        },
      ],
    },
    features: {
      'zh-CN': [
        {
          title: '快速入门',
          details:
            '将向您介绍 80% 的 React 概念，这些概念将是您日常开发中经常用到的...'
        },
        {
          title: '编程思想',
          details:
            '以前你看到的是一片森林，使用 React 后，你将欣赏到每一棵树...'
        },
        {
          title: 'Redux',
          details: 'JavaScript 状态容器，提供可预测化的状态管理...'
        }
      ],
    },
    footer: 'Leon | Copyright © 2023-present',
  },
});
