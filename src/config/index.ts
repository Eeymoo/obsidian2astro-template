import type { Config } from "./types";

const config: Config = {
  siteTitle: "Eeymoo's Blog",
  siteDescription: "记录、学习、分享技术与生活点滴",
  siteUrl: "https://blog.eeymoo.com",
  siteIcon: "https://avatars.githubusercontent.com/u/174967750?v=4",
  siteAuthor: "Eeymoo",
  twitterCreator: "@eeymoo",
  googleSiteVerification: "PVxtW6MnJYdBv7MoHJjCTH-Vzotp1gT8_0F67f2hyrc",
  bingSiteVerification: "YOUR_BING_VERIFICATION_CODE",
  navLinks: [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Blog",
      href: "/post",
      activePattern: "^/(post|microblog|archives|tags|categories)",
      children: [
        { name: "Microblog", href: "/microblog" },
        { name: "Archives", href: "/archives" },
      ],
    },
    {
      name: "Token Usage",
      href: "/tags/AICG/",
    },,
    {
      name: "Tools",
      href: "/tool",
      activePattern: "^/tool",
      children: [
        { name: "URL 重定向", href: "/tool/goto" },
        { name: "Gzip 压缩率对比", href: "/tool/gzip-compare" },
      ],
    },
    {
      name: "Friends",
      href: "/friends",
    },
    // {
    //   name: "donate",
    //   href: "/donate",
    // },
  ],
  friendlyLink: [
    {
      name: "jellyfin",
      link: "https://jellyfin-cn.eeymoo.com/",
      desc: "为中国大陆用户提供高速稳定的 jellyfin 插件镜像服务",
      img: "https://jellyfin-cn.eeymoo.com/assets/icon.png",
    },
    {
      name: "dreamytzk",
      link: "https://www.antmoe.com/",
      desc: "",
      img: "https://avatars.githubusercontent.com/u/82026204?v=4",
    },
    {
      name: "lhDream's Blog",
      link: "https://blog.luhua.site/",
      desc: "技术、游戏、生活 | 我的个人空间",
      img: "https://blog.luhua.site/upload/%E5%A4%B4%E5%83%8F%E4%B8%93%E7%94%A8%E5%9B%BE.png?width=1600",
    },
    {
      name: "獭獭的学习笔记",
      link: "https://otter-assistant.github.io",
      desc: "一只20岁的小水獭的学习与成长记录 🦦",
      img: "https://avatars.githubusercontent.com/u/174967750?v=4",
    },
    {
      name: "zeroanon",
      link: "https://zeroanon.com",
      desc: "不做圣经里腐朽的诗集，要做禁书里最惊世骇俗的篇章",
      img: "https://avatars.githubusercontent.com/u/119206123?v=4",
    },
  ],
  donate: {
    etcAddress: "0x5d0738e5904a1c8dad3f6ef71453a61caeebdd9d",
    solAddress: "fkdthsy7cifdnqhsrhm3rt3mchdueubug4uxqykqzdjr",
  },
  comments: {
    system: 'giscus',
    giscus: {
      repo: "eeymoo/eeymoo.github.io",
      repoId: "r_kgdon12345",
      category: "general",
      categoryId: "dic_kwdon123456",
      mapping: "pathname",
      strict: "0",
      reactionsEnabled: "1",
      emitMetadata: "0",
      inputPosition: "top",
      theme: "preferred_color_scheme",
      lang: "zh-cn",
      loading: "lazy",
    },
    gitalk: {
      clientID: "your_github_app_client_id",
      clientSecret: "your_github_app_client_secret",
      repo: "eeymoo.github.io",
      owner: "eeymoo",
      admin: ["eeymoo"],
      language: "zh-cn",
      distractionFreeMode: false,
    },
  },
  goto: {
    path: '/tool/goto',
    whiteList: [
      '/^https?:\/\/github\.com\/eeymoo/i',          // GitHub 个人主页
      // '*.google.com/*',                              // 通配符：匹配所有 google.com 子域名的任意路径
      // '/^https?:\/\/([^.]+\.)*google\.com\//i',  // 正则：匹配 google.com 及其子域名
    ],
    friendlyLinkUseGoto: false,
    http: {
      disableAutoRedirect: true,
      showWarning: true,
    },
  },
  background: {
    dotSize: 1,
    dotSizeHighlight: 2,
    dotGap: 40,
    polygonSides: [3, 4, 6],
    showLines: false,
  },
};
export default config;
