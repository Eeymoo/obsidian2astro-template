import type { Config } from "./types";

const config: Config = {
  siteTitle: "My Astro Site",
  siteDescription: "A description of my Astro site.",
  siteUrl: "https://www.example.com",
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
};
export default config;
