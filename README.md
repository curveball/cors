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

[1]: https://github.com/curveball/
