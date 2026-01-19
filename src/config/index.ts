import type { Config } from "./types";

const config: Config = {
  siteTitle: "Eeymoo's Blog",
  siteDescription: "记录、学习、分享技术与生活点滴",
  siteUrl: "https://blog.eeymoo.com",
  siteIcon: "https://avatars.githubusercontent.com/u/174967750?v=4",
  navLinks: [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Blog",
      href: "/post",
    },
    {
      name: "AICG",
      href: "/tags/AICG",
    },
    {
      name: "Categories",
      href: "/categories",
    },
    {
      name: "Tags",
      href: "/tags",
    },
    {
      name: "Archives",
      href: "/archives",
    },
    {
      name: "Friends",
      href: "/friends",
    },
    // {
    //   name: "Donate",
    //   href: "/donate",
    // },
  ],
  friendlyLink: [
    {
      name: "Jellyfin",
      link: "https://jellyfin-cn.eeymoo.com/",
      desc: "为中国大陆用户提供高速稳定的 Jellyfin 插件镜像服务",
      img: "https://jellyfin-cn.eeymoo.com/assets/icon.png",
    },
    {
      name: "zeroanon",
      link: "https://zeroanon.com/",
      desc: "不做圣经里腐朽的诗集，要做禁书里最惊世骇俗的篇章",
      img: "https://avatars.githubusercontent.com/u/119206123?v=4",
    },
    {
      name: "DreamyTZK",
      link: "https://www.antmoe.com/",
      desc: "",
      img: "https://avatars.githubusercontent.com/u/82026204?v=4",
    },
  ],
  donate: {
    etcAddress: "0x5d0738e5904a1c8dad3f6ef71453a61caeebdd9d",
    solAddress: "FkdthSY7ciFDNQhsrHm3rt3mCHDUeubUG4uXqyKqZdjR",
  },
};
export default config;
