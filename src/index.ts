import { Middleware } from '@curveball/core';

type CorsOptions = {
  allowOrigin: string[],
  allowHeaders?: string[],
  allowMethods?: string[],
  exposeHeaders?: string[],
}

export default function(options: CorsOptions): Middleware {

  return (ctx, next) => {

    const origin = ctx.request.headers.get('Origin');

    if (origin) {
      ctx.response.headers.set('Access-Control-Allow-Origin', options.allowOrigin);
      if (options.allowHeaders) {
        ctx.response.headers.set('Access-Control-Allow-Headers', options.allowHeaders);
      }
      if (options.allowMethods) {
        ctx.response.headers.set('Access-Control-Allow-Methods', options.allowMethods);
      }
      if (options.exposeHeaders) {
        ctx.response.headers.set('Access-Control-Expose-Headers', options.exposeHeaders);
      }
    }

    if (ctx.method !== 'OPTIONS') {
      return next();
    } else {
      ctx.status = 200;
      return undefined;
    }
  }
}