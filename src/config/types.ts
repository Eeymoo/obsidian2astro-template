type Config = {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  siteIcon: string;
  // 导航链接
  navLinks: Array<NavLink>;
  // 友情连接
  friendlyLink: Array<FriendlyLink>;
  // 捐赠地址
  donate?: DonateConfig;
  // 评论系统配置
  comments: CommentsConfig;
};

type CommentsConfig = {
  system: 'giscus' | 'gitalk';
  giscus?: GiscusConfig;
  gitalk?: GitalkConfig;
};

type DonateConfig = {
  etcAddress?: string;
  solAddress?: string;
};

type GiscusConfig = {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: string;
  term?: string;
  strict?: string;
  reactionsEnabled?: string;
  emitMetadata?: string;
  inputPosition?: string;
  theme?: string;
  lang?: string;
  loading?: string;
};

type GitalkConfig = {
  clientID: string;
  clientSecret: string;
  repo: string;
  owner: string;
  admin: string[];
  id?: string;
  distractionFreeMode?: boolean;
  language?: string;
  proxy?: string;
};

type NavLink = {
  name: string;
  href?: string;
  // optional children for dropdowns
  children?: Array<NavLink>;
  // disable clicking on the main item (useful for labels/groups)
  disabled?: boolean;
};

type FriendlyLink = {
  name: string;
  link: string;
  desc: string;
  img: string;
};
export type { Config, NavLink, FriendlyLink, DonateConfig, GiscusConfig, GitalkConfig, CommentsConfig };
