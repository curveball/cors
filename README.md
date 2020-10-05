Curveball CORS middleware
=====================

This package is a middleware for the [Curveball][1] framework.

Installation
------------

    npm install @curveball/cors 


Getting started
---------------

After installing the NPM package, simply import the CORS middleware to an existing Curveball server:

```typescript
import cors from '@curveball/cors';
import { Application } from '@curveball/core';

const app = new Application();
app.use(cors());
```

When manually providing CORS options, here are few options and how it should look

```
app.use(cors({
    allowOrigin: '*',
    allowHeaders: ['Content-Type', 'Accept'],
    allowMethods: ['GET', 'POST'],
    exposeHeaders: ['Link', 'Date']
}));

```

Providing CORS headers is optional, without providing any CORS options, it will auto-generate these values

```
allowOrigin: '*',
allowHeaders: ['"Content-Type", "User-Agent", "Authorization", "Accept", "Prefer", "Prefer-Push", "Link"'],
allowMethods: ["DELETE", "GET", "PATCH", "POST", "PUT"],
exposeHeaders: ["Location", "Link"]
```


[1]: https://github.com/curveball/

