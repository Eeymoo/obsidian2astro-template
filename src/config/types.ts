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
};

type DonateConfig = {
  etcAddress?: string;
  solAddress?: string;
};

type NavLink = {
  name: string;
  href: string;
};

type FriendlyLink = {
  name: string;
  link: string;
  desc: string;
  img: string;
};
export type { Config, NavLink, FriendlyLink, DonateConfig };