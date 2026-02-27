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
  // Goto 跳转配置
  goto?: GotoConfig;
  // 背景配置
  bg?: BgConfig;
};

type GotoConfig = {
  path: string;
  whiteList: string[];
  friendlyLinkUseGoto: boolean;
  http: {
    disableAutoRedirect: boolean;
    showWarning: boolean;
  };
};

type BgConfig = {
  dotSize: number;          // 默认点半径
  dotSizeHighlight: number; // 高亮点半径
  dotGap: number;           // 点间距
  polygonSides: number[];   // 多边形边数数组，从中随机选择
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
export type { Config, NavLink, FriendlyLink, DonateConfig, GiscusConfig, GitalkConfig, CommentsConfig, GotoConfig, BgConfig };
