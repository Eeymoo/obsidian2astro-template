import { defineMiddleware } from "astro:middleware";

// 移动设备UA检测正则
const MOBILE_UA_REGEX = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

// 排除重定向的路径（API、管理页面、RSS等）
const EXCLUDE_PATHS = ['/api/', '/admin/', '/rss.xml', '/sitemap.xml'];

// 路由映射表 - 桌面端到移动端
const DESKTOP_TO_MOBILE_MAPPINGS = {
  '/': '/m/',
  '/post': '/m/post',
  '/categories': '/m/categories',
  '/tags': '/m/tags',
  '/archives': '/m/archives',
  '/friends': '/m/friends',
  '/about': '/m/about',
  '/donate': '/m/donate',
  '/goto': '/m/goto',
  '/blog': '/m/blog',
  // Microblog路由映射
  '/microblog/': '/m/microblog/',
  '/microblog': '/m/microblog/',
  '/microblog/latest': '/m/microblog/latest',
  '/microblog/today': '/m/microblog/today',
  '/microblog/all': '/m/microblog/feed', // all重定向到feed无限滚动
} as const;

// 移动端到桌面端反向映射
const MOBILE_TO_DESKTOP_MAPPINGS = {
  '/m/': '/',
  '/m/post': '/post',
  '/m/categories': '/categories',
  '/m/tags': '/tags',
  '/m/archives': '/archives',
  '/m/friends': '/friends',
  '/m/about': '/about',
  '/m/donate': '/donate',
  '/m/goto': '/goto',
  '/m/blog': '/blog',
  // Microblog反向映射
  '/m/microblog/': '/microblog/',
  '/m/microblog': '/microblog/',
  '/m/microblog/latest': '/microblog/latest',
  '/m/microblog/today': '/microblog/today',
  '/m/microblog/feed': '/microblog/all', // feed对应all页面
} as const;

export const onRequest = defineMiddleware((context, next) => {
  const userAgent = context.request.headers.get("user-agent") || "";
  const pathname = context.url.pathname;
  
  // 排除特定路径
  if (EXCLUDE_PATHS.some(path => pathname.startsWith(path))) {
    return next();
  }
  
  const isMobile = MOBILE_UA_REGEX.test(userAgent);
  const isAlreadyMobile = pathname.startsWith('/m/');
  
  // 移动设备访问桌面端路由，重定向到移动端
  if (isMobile && !isAlreadyMobile) {
    // 精确匹配路由映射
    for (const [desktopPath, mobilePath] of Object.entries(DESKTOP_TO_MOBILE_MAPPINGS)) {
      if (pathname === desktopPath || pathname.startsWith(desktopPath)) {
        let redirectPath = mobilePath;
        
        // 处理动态路由参数
        if (pathname.startsWith(desktopPath) && pathname !== desktopPath) {
          const suffix = pathname.slice(desktopPath.length);
          redirectPath = mobilePath + suffix;
        }
        
        // 处理根路径特殊情况
        if (pathname === '/' && redirectPath === '/m/') {
          return Response.redirect(new URL(redirectPath, context.url), 301);
        }
        
        return Response.redirect(new URL(redirectPath, context.url), 301);
      }
    }
  }
  
  // 桌面端访问移动端路由，重定向回桌面端
  if (!isMobile && isAlreadyMobile) {
    for (const [mobilePath, desktopPath] of Object.entries(MOBILE_TO_DESKTOP_MAPPINGS)) {
      if (pathname === mobilePath || pathname.startsWith(mobilePath)) {
        let redirectPath = desktopPath;
        
        // 处理动态路由参数
        if (pathname.startsWith(mobilePath) && pathname !== mobilePath) {
          const suffix = pathname.slice(mobilePath.length);
          redirectPath = desktopPath + suffix;
        }
        
        return Response.redirect(new URL(redirectPath, context.url), 301);
      }
    }
  }
  
  return next();
});