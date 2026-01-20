/**
 * 过滤内容的工具方法
 * @param posts - 需要过滤的内容数组
 * @param filterType - 过滤类型，可选，默认为 'default'，可选 'default' | 'microblog'
 * @returns 过滤后的内容数组
 * @description 通用规则：会过滤掉所有 hidden === true 的内容
 */
export function filterContent(posts: any[], filterType: 'default' | 'microblog' = 'default') {
  if (!Array.isArray(posts)) return [];
  
  // 通用过滤规则：过滤掉 hidden === true 的内容
  let filteredPosts = posts.filter(post => post?.data?.hidden !== true);
  
  if (filterType === 'default') {
    // 默认过滤规则：过滤掉 categories === 'microblog' 的内容
    return filteredPosts.filter(post => post?.data?.categories !== 'microblog');
  } else if (filterType === 'microblog') {
    // microblog 过滤规则：只保留 categories === 'microblog' 的内容
    return filteredPosts.filter(post => post?.data?.categories === 'microblog');
  }
  // 其他类型暂不处理，返回过滤后的数组
  return filteredPosts;
}
