export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // 主路由将 /posts/* 转发至此，剥离 /posts 前缀以匹配 out/ 目录结构
    url.pathname = url.pathname.replace(/^\/posts/, '') || '/';
    return env.ASSETS.fetch(url);
  },
};
