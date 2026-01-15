type Config = {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  // 友情连接
  friendlyLink: Array<FriendlyLink>;
};

type FriendlyLink = {
  name: string;
  link: string;
  desc: string;
  img: string;
};
export type { Config, FriendlyLink };