import { Middleware, Context } from '@curveball/kernel';
import { Forbidden } from '@curveball/http-errors';

type OriginValidator = (origin: string) => boolean;

type CorsOptions = {
  allowOrigin: string[] | string | OriginValidator;
  allowHeaders: string[];
  allowMethods: string[];
  exposeHeaders: string[];
  credentials?: boolean;
}

function isOriginAllowed(allowOrigin: string | string[] | OriginValidator, origin: string): boolean {
  if (typeof allowOrigin === 'function') {
    return allowOrigin(origin);
  }

  const allowedOrigins = Array.isArray(allowOrigin) ? allowOrigin : [allowOrigin];
  return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
}

function setCorsHeaders(ctx: Context, options: CorsOptions, origin: string) {
  ctx.response.headers.set('Access-Control-Allow-Origin', origin);
  if (options.allowHeaders ) {
    ctx.response.headers.set('Access-Control-Allow-Headers', options.allowHeaders);
  }
  if (options.allowMethods ) {
    ctx.response.headers.set('Access-Control-Allow-Methods', options.allowMethods);
  }
  if (options.exposeHeaders ) {
    ctx.response.headers.set('Access-Control-Expose-Headers', options.exposeHeaders);
  }
  if (options.credentials) {
    ctx.response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
}

function validateOptions(options: CorsOptions): void {
  if (options.credentials && options.allowHeaders.includes('*')) {
    throw new Error('Access-Control-Allow-Headers cannot be * when Access-Control-Allow-Credentials is true');
  }

  if (typeof options.allowOrigin === 'string' || Array.isArray(options.allowOrigin)) {
    const allowedOrigins = Array.isArray(options.allowOrigin) ? options.allowOrigin : [options.allowOrigin];
    if (!allowedOrigins.every(i => typeof i === 'string' && !i.match(/[/]$/))) {
      // regex matching for / ([/]) at the end ($) of string
      console.warn('⚠️ \x1b[33m [cors] Invalid origin provided, origins never end in a / slash. Invalid origins will be ignored from the allowedOrigins list. \x1b[0m'); // eslint-disable-line no-console
      console.log('⚠️  Provided allowedOrigins list:', allowedOrigins); // eslint-disable-line no-console
    }
  }
}

export default function(optionsInit?: Partial<CorsOptions>): Middleware {

  const options = generateOptions(optionsInit);

  validateOptions(options);

  return (ctx, next) => {

    const origin = ctx.request.headers.get('Origin');

    if (origin) {

      if (!isOriginAllowed(options.allowOrigin, origin)) {
        throw new Forbidden(`HTTP request for origin ${origin} is not allowed.`);
      }

      setCorsHeaders(ctx, options, origin);

      if (ctx.method==='OPTIONS') {
        // This was a pre-flight request, so we no longer want to pass this request
        // down the stack.
        ctx.status = 200;
        return;
      }

    }

    return next();

  };

}

function generateOptions(init?: Partial<CorsOptions> ) : CorsOptions {
  if (!init) init = {};
  return {
    allowOrigin: init.allowOrigin || '*',
    allowHeaders: init.allowHeaders || ['Content-Type', 'User-Agent', 'Authorization', 'Accept', 'Prefer', 'Prefer-Push', 'Link'],
    allowMethods: init.allowMethods || ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'],
    exposeHeaders: init.exposeHeaders || ['Location', 'Link'],
    credentials: init.credentials || false
  };
}
