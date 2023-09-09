import { Middleware } from '@curveball/kernel';
import { Forbidden } from '@curveball/http-errors';

type CorsOptions = {
  allowOrigin: string[] | string;
  allowHeaders: string[];
  allowMethods: string[];
  exposeHeaders: string[];
  credentials?: boolean;
}

export default function(optionsInit?: Partial<CorsOptions>): Middleware {

  const options = generateOptions(optionsInit);

  if (options.credentials && options.allowHeaders.includes('*')) {
    throw new Error('Access-Control-Allow-Headers cannot be * when Access-Control-Allow-Credentials is true');
  }

  const allowedOrigins = Array.isArray(options.allowOrigin) ? options.allowOrigin : [options.allowOrigin];

  if (!allowedOrigins.every(i => !i.match(/[/]$/))) {
    // regex matching for / ([/]) at the end ($) of string
    console.warn('⚠️ \x1b[33m [cors] Invalid origin provided, origins never end in a / slash. Invalid origins will be ignored from the allowedOrigins list. \x1b[0m'); // eslint-disable-line no-console
    console.log('⚠️  Provided allowedOrigins list:', allowedOrigins); // eslint-disable-line no-console
  }

  const allowedOriginRegexes = generateOriginRegexes(allowedOrigins);

  return (ctx, next) => {

    const origin = ctx.request.headers.get('Origin');

    if (origin) {

      const isOriginAllowed = allowedOriginRegexes.some((regex) =>
        regex.test(origin),
      );

      if (!isOriginAllowed) {
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
      if (options.credentials) {
        ctx.response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
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

/**
 * Generate regexes for all allowed origins.
 *
 * 'https://*.example.com' -> ^https://[^ ]*\.example\.com$ (matches all subdomains)
 * 'https://example.com'   -> ^https://example\.com$        (matches only this)
 * '*'                     -> '^[^ ]*$                      (matches everything)
 */
function generateOriginRegexes(allowedOrigins: string[]): RegExp[] {
  return allowedOrigins.map(
    (pattern) => {
      const escapedPattern = escapeOriginPattern(pattern);
      return  new RegExp(`^${escapedPattern.replace(/\*/g, '[^ ]*')}$`);
    }
  );
}

/**
 * Escape special characters in a pattern. This prevents issues where special characters
 * such as a dot in the pattern are interpreted as regex characters.
 *
 * For example:
 * 'https://*.example.com' -> 'https://[^ ]*\.example\.com'
 */
function escapeOriginPattern(s: string): string {
  return s.replace(/\./g, '\\.');
}
