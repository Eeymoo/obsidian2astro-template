import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../consts";

export async function GET(context) {
  const posts = await getCollection("blog");
  const rssData = {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description:
        post.data.description ||
        post.body?.slice(0, 200) ||
        "This post has no description.",
      link: `${SITE_URL}/post/${post.id}/`,
      pubDate: new Date(post.data.date),
      categories: post.data.tags || [],
      customData: post.data.categories
        ? `<category>${post.data.categories}</category>`
        : "",
    })),
  };
  try {
    return rss(rssData);
  } catch (e) {
    return JSON.stringify(rssData);
  }
}
