import { Middleware } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';

type CorsOptions = {
  allowOrigin: string[] | string;
  allowHeaders: string[];
  allowMethods: string[];
  exposeHeaders: string[];
}

export default function(optionsInit?: Partial<CorsOptions>): Middleware {

  const options = generateOptions(optionsInit);

  const allowedOrigins = Array.isArray(options.allowOrigin) ? options.allowOrigin : [options.allowOrigin];

  if (!allowedOrigins.every(i => !i.match(/[/]$/))) {
    // regex matching for / ([/]) at the end ($) of string
    console.warn('⚠️ \x1b[33m [cors] Invalid origin provided, origins never end in a / slash. Invalid origins will be ignored from the allowedOrigins list. \x1b[0m'); // eslint-disable-line no-console
    console.log('⚠️  Provided allowedOrigins list:', allowedOrigins); // eslint-disable-line no-console
  }

  return (ctx, next) => {

    const origin = ctx.request.headers.get('Origin');

    if (origin) {

      if (!allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
        throw new Forbidden(`HTTP request for origin ${origin} is not allowed.`);
      }

      ctx.response.headers.set('Access-Control-Allow-Origin', origin);
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
  };

}

function generateOptions(init?: Partial<CorsOptions> ) : CorsOptions {
  if (!init) init = {};
  return {
    allowOrigin: init.allowOrigin || '*',
    allowHeaders: init.allowHeaders || ['Content-Type', 'User-Agent', 'Authorization', 'Accept', 'Prefer', 'Prefer-Push', 'Link'],
    allowMethods: init.allowMethods || ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'],
    exposeHeaders: init.exposeHeaders || ['Location', 'Link']
  };
}
