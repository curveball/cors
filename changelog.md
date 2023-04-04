Changelog
=========

0.3.0 (2023-04-04)
------------------

* This package now supports ESM and CommonJS modules.
* No longer supports Node 14. Please use Node 16 or higher.


0.2.0 (2022-09-03)
------------------

* Upgraded from `@curveball/core` to `@curveball/kernel`.


0.1.7 (2022-05-11)
------------------

* Support for the `Access-Control-Allow-Credentials` header. (@defrex)
* Now emits a warning when an `Origin` is set that ends with a slash. This is a
  common mistake and always wrong. (@BeckyPollard)


0.1.6 (2022-02-22)
------------------

* Updated for `@curveball/core` 0.17


0.1.5 (2021-12-14)
------------------

* #20: When OPTIONS requests are made, and they are not CORS pre-flight
  requests this middleware did not pass the request through for other
  middlewares to handle.


0.1.4 (2021-10-29)
------------------

* Warn in console if an origin passed in allowOrigin is invalid and ignored due
  to ending with a slash.
* Updating dependencies


0.1.3 (2021-05-31)
------------------

* Updating dependencies


0.1.2 (2021-05-07)
------------------

* Updating dependencies


0.1.1 (2021-05-06)
------------------

* Releasing on Github packages
* Updated lint rules
* Make file update
* Updated dependencies


0.1.0 (2020-10-08)
------------------

* It is now optional now to not provided any options, it will pick good default
  options.


0.0.1 (2020-09-16)
------------------

* First version
