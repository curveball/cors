import { Application } from '@curveball/core';
import cors from '../src/index';
import { expect } from 'chai';

describe('CORS middleware', () => {

  it('should not respond with CORS headers if there was no Origin header', async () => {

    const options = {
      allowOrigin: ['https://example.org']
    }
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
    }
    const headers = {
      Origin: 'https://example.com'
    }
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

  it('should respond 403 Forbidden, if the origin did not match an origin in the allowed list', async () => {

    const options = {
      allowOrigin: ['https://example.org', 'https://example.com'],
      allowHeaders: ['Content-Type', 'Accept'],
      allowMethods: ['GET', 'POST'],
      exposeHeaders: ['Link', 'Date']
    }
    const headers = {
      Origin: 'https://example.net'
    }
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
    }
    const headers = {
      Origin: 'https://example.com'
    }
    const app = new Application;
    app.use(cors(options));

    app.use( ctx => {

      ctx.status = 200;
      ctx.response.body = 'hello world';

    });

    const response = await app.subRequest('GET', '/', headers);

    expect(response.status).to.equal(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).to.equal('https://example.com');
    expect(response.headers.get('Access-Control-Allow-Headers')).to.equal(null);
    expect(response.headers.get('Access-Control-Allow-Methods')).to.equal(null);  
    expect(response.headers.get('Access-Control-Expose-Headers')).to.equal(null);

    expect(response.body).to.equal('hello world');

  });

  it('should support * for origin', async () => {

    const options = {
      allowOrigin: '*',
      allowHeaders: ['Content-Type', 'Accept'],
      allowMethods: ['GET', 'POST'],
      exposeHeaders: ['Link', 'Date']
    }
    const headers = {
      Origin: 'https://example.net'
    }
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

  it('should respond to OPTIONS request', async() => {
    const options = {
      allowOrigin: ['https://example.org'],
      allowHeaders: ['Content-Type', 'Accept'],
      allowMethods: ['GET', 'POST'],
      exposeHeaders: ['Link', 'Date']
    }
    const headers = {
      Origin: 'https://example.org'
    }
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



});
