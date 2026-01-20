/**
 * 过滤内容的工具方法
 * @param posts - 需要过滤的内容数组
 * @param filterType - 过滤类型，可选，默认为 'default'，可选 'default' | 'microblog'
 * @returns 过滤后的内容数组
 */
export function filterContent(posts: any[], filterType: 'default' | 'microblog' = 'default') {
  if (!Array.isArray(posts)) return [];
  if (filterType === 'default') {
    // 默认过滤规则：过滤掉 categories === 'microblog' 的内容
    return posts.filter(post => post?.data?.categories !== 'microblog');
  } else if (filterType === 'microblog') {
    // microblog 过滤规则：只保留 categories === 'microblog' 的内容
    return posts.filter(post => post?.data?.categories === 'microblog');
  }
  // 其他类型暂不处理，返回原数组
  return posts;
}
