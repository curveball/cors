import { Application } from '@curveball/kernel';
import cors from '../src/index.js';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('CORS middleware', () => {

  it('should not respond with CORS headers if there was no Origin header', async () => {

    const options = {
      allowOrigin: ['https://example.org']
    };
    const app = new Application;
    app.use(cors(options));

    app.use( ctx => {

      ctx.status = 200;
      ctx.response.body = 'hello world';

    });

    const response = await app.subRequest('GET', '/');

    expect(response.status).to.equal(200);
    expect(response.headers.has('Access-Control-Allow-Origin')).to.equal(false);
    expect(response.headers.has('Access-Control-Allow-Headers')).to.equal(false);
    expect(response.headers.has('Access-Control-Allow-Methods')).to.equal(false);
    expect(response.headers.has('Access-Control-Expose-Headers')).to.equal(false);

    expect(response.body).to.equal('hello world');

  });

  it('should respond with CORS headers if there was a Origin header on a GET request', async () => {

    const options = {
      allowOrigin: ['https://example.org', 'https://example.com'],
      allowHeaders: ['Content-Type', 'Accept'],
      allowMethods: ['GET', 'POST'],
      exposeHeaders: ['Link', 'Date']
    };
    const headers = {
      Origin: 'https://example.com'
    };
    const app = new Application;
    app.use(cors(options));

    app.use( ctx => {

      ctx.status = 200;
      ctx.response.body = 'hello world';

    });

    const response = await app.subRequest('GET', '/', headers);

    expect(response.status).to.equal(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).to.equal('https://example.com');
    expect(response.headers.get('Access-Control-Allow-Headers')).to.equal('Content-Type, Accept');
    expect(response.headers.get('Access-Control-Allow-Methods')).to.equal('GET, POST');
    expect(response.headers.get('Access-Control-Expose-Headers')).to.equal('Link, Date');

    expect(response.body).to.equal('hello world');

  });

  it('should warn in console if an origin in the allowed list has a trailing slash / at its end', async () => {

    const spy = sinon.spy(console, 'warn');

    const options = {
      allowOrigin: ['https://example.org/', 'https://example.com']
    };
    const app = new Application;
    app.use(cors(options));

    expect(spy.calledWith('⚠️ \x1b[33m [cors] Invalid origin provided, origins never end in a / slash. Invalid origins will be ignored from the allowedOrigins list. \x1b[0m')).to.equal(true);

    spy.restore();

  });

  it('should respond 403 Forbidden, if the origin did not match an origin in the allowed list', async () => {

    const options = {
      allowOrigin: ['https://example.org', 'https://example.com'],
      allowHeaders: ['Content-Type', 'Accept'],
      allowMethods: ['GET', 'POST'],
      exposeHeaders: ['Link', 'Date']
    };
    const headers = {
      Origin: 'https://example.net'
    };
    const app = new Application;
    app.use(cors(options));

    app.use( ctx => {

      ctx.status = 200;
      ctx.response.body = 'hello world';

    });

    const response = await app.subRequest('GET', '/', headers);

    expect(response.status).to.equal(403);

  });

  it('should respond with CORS headers if there was a Origin header on a GET request with only some of the options set', async () => {

    const options = {
      allowOrigin: ['https://example.org', 'https://example.com'],
    };
    const headers = {
      Origin: 'https://example.com'
    };
    const app = new Application;
    app.use(cors(options));

    app.use( ctx => {

      ctx.status = 200;
      ctx.response.body = 'hello world';

    });

    const response = await app.subRequest('GET', '/', headers);

    expect(response.status).to.equal(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).to.equal('https://example.com');
    expect(response.headers.get('Access-Control-Allow-Headers')).to.equal('Content-Type, User-Agent, Authorization, Accept, Prefer, Prefer-Push, Link');
    expect(response.headers.get('Access-Control-Allow-Methods')).to.equal('DELETE, GET, PATCH, POST, PUT');
    expect(response.headers.get('Access-Control-Expose-Headers')).to.equal('Location, Link');

    expect(response.body).to.equal('hello world');

  });

  it('should support * for origin', async () => {

    const options = {
      allowOrigin: '*',
      allowHeaders: ['Content-Type', 'Accept'],
      allowMethods: ['GET', 'POST'],
      exposeHeaders: ['Link', 'Date']
    };
    const headers = {
      Origin: 'https://example.net'
    };
    const app = new Application;
    app.use(cors(options));

    app.use( ctx => {

      ctx.status = 200;
      ctx.response.body = 'hello world';

    });

    const response = await app.subRequest('GET', '/', headers);

    expect(response.status).to.equal(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).to.equal('https://example.net');
    expect(response.headers.get('Access-Control-Allow-Headers')).to.equal('Content-Type, Accept');
    expect(response.headers.get('Access-Control-Allow-Methods')).to.equal('GET, POST');
    expect(response.headers.get('Access-Control-Expose-Headers')).to.equal('Link, Date');

    expect(response.body).to.equal('hello world');

  });

  it('should support credentials', async () => {

    const options = {
      allowOrigin: '*',
      allowHeaders: ['Content-Type', 'Accept'],
      allowMethods: ['GET', 'POST'],
      credentials: true
    };
    const headers = {
      Origin: 'https://example.net'
    };
    const app = new Application;
    app.use(cors(options));

    app.use( ctx => {

      ctx.status = 200;
      ctx.response.body = 'hello world';

    });

    const response = await app.subRequest('GET', '/', headers);

    expect(response.status).to.equal(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).to.equal('https://example.net');
    expect(response.headers.get('Access-Control-Allow-Headers')).to.equal('Content-Type, Accept');
    expect(response.headers.get('Access-Control-Allow-Methods')).to.equal('GET, POST');
    expect(response.headers.get('Access-Control-Allow-Credentials')).to.equal('true');

    expect(response.body).to.equal('hello world');

  });

  it('should prevent using credentials with * headers', async () => {

    const options = {
      allowOrigin: '*',
      allowHeaders: ['*'],
      allowMethods: ['GET', 'POST'],
      credentials: true
    };

    expect(() => {
      cors(options);
    }).to.throw();

  });

  it('should respond to OPTIONS request', async() => {
    const options = {
      allowOrigin: ['https://example.org'],
      allowHeaders: ['Content-Type', 'Accept'],
      allowMethods: ['GET', 'POST'],
      exposeHeaders: ['Link', 'Date']
    };
    const headers = {
      Origin: 'https://example.org'
    };
    const app = new Application;
    app.use(cors(options));

    app.use( ctx => {

      ctx.status = 200;
      ctx.response.body = 'hello world';

    });

    const response = await app.subRequest('OPTIONS', '/', headers);

    expect(response.status).to.equal(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).to.equal('https://example.org');
    expect(response.headers.get('Access-Control-Allow-Headers')).to.equal('Content-Type, Accept');
    expect(response.headers.get('Access-Control-Allow-Methods')).to.equal('GET, POST');
    expect(response.headers.get('Access-Control-Expose-Headers')).to.equal('Link, Date');

    expect(response.body).to.equal(null);

  });


  it('should pass through OPTIONS requests if no Origin header was set', async () => {

    const options = {
      allowOrigin: ['https://example.org'],
      allowHeaders: ['Content-Type', 'Accept'],
      allowMethods: ['GET', 'POST'],
      exposeHeaders: ['Link', 'Date']
    };
    const headers = {};
    const app = new Application;
    app.use(cors(options));

    app.use( ctx => {

      ctx.status = 200;
      ctx.response.body = ctx.method;

    });

    const response = await app.subRequest('OPTIONS', '/', headers);
    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OPTIONS');

  });

  it('should allow origin matching wildcard pattern', async () => {
    const options = {
      allowOrigin: ['https://*.example.com']
    };
    const headers = {
      Origin: 'https://sub.example.com'
    };
    const app = new Application;
    app.use(cors(options));
    app.use( ctx => {
      ctx.status = 200;
      ctx.response.body = 'hello world';
    });

    const response = await app.subRequest('GET', '/', headers);
    expect(response.status).to.equal(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).to.equal('https://sub.example.com');
  });

  it('should disallow origin not matching wildcard pattern', async () => {
    const options = {
      allowOrigin: ['https://*.example.com']
    };
    const headers = {
      Origin: 'https://sub.example.net'
    };
    const app = new Application;
    app.use(cors(options));
    app.use( ctx => {
      ctx.status = 200;
      ctx.response.body = 'hello world';
    });

    const response = await app.subRequest('GET', '/', headers);
    expect(response.status).to.equal(403);
  });

  it('should disallow origin that partially matches wildcard pattern', async () => {
    const options = {
      allowOrigin: ['https://*.example.com']
    };
    const headers = {
      Origin: 'https://evilexample.com'
    };
    const app = new Application;
    app.use(cors(options));
    app.use( ctx => {
      ctx.status = 200;
      ctx.response.body = 'hello world';
    });

    const response = await app.subRequest('GET', '/', headers);
    expect(response.status).to.equal(403);
  });

  it('should disallow origin that overlap with the wildcard domain name', async () => {
    const options = {
      allowOrigin: ['https://*.example.com']
    };
    const headers = {
      Origin: 'https://example.com.evil.com'
    };
    const app = new Application;
    app.use(cors(options));
    app.use( ctx => {
      ctx.status = 200;
      ctx.response.body = 'hello world';
    });

    const response = await app.subRequest('GET', '/', headers);
    expect(response.status).to.equal(403);
  });

  it('should allow multiple wildcard patterns', async () => {
    const options = {
      allowOrigin: ['https://*.example.com', 'https://*.example.net']
    };
    const headers1 = {
      Origin: 'https://sub.example.com'
    };
    const headers2 = {
      Origin: 'https://sub.example.net'
    };
    const app = new Application;
    app.use(cors(options));
    app.use( ctx => {
      ctx.status = 200;
      ctx.response.body = 'hello world';
    });

    const response1 = await app.subRequest('GET', '/', headers1);
    expect(response1.status).to.equal(200);
    expect(response1.headers.get('Access-Control-Allow-Origin')).to.equal('https://sub.example.com');

    const response2 = await app.subRequest('GET', '/', headers2);
    expect(response2.status).to.equal(200);
    expect(response2.headers.get('Access-Control-Allow-Origin')).to.equal('https://sub.example.net');
  });

});
