# http-server-request-handlers-db
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![NSP Status][nsp-image]][nsp-url]

an http.Server request handler that attempts to re-initialize a db connection with `app.setupDb`.

the initial intent of this module is to provide a way to re-initialize a mongoose connection, on an http request, if the connection threw an error on application startup or was lost after startup.

## table of contents
* [notes](#notes)
* [installation](#installation)
* [api](#api)
* [usage](#usage)
    * [basic](#basic)
* [license](#license)

## notes
* expects `req.app` to exist; e.g., in express it’s the `IncomingMessage`
* interacts with the following properties on the `app` if they exist
    * `app.debug` - when set to true, the request handler will `console` log an info statement
    * `app.db.error` - when not set, the request handler will not attempt to re-initialize the db connection
    * `app.setupDb` - a promise that that will return the `db` connection or reject with an `Error`
        * only called when `app.db.error` is set and `app.setupDb` is a function
        * will set `app.db` to the returned db connection
        * if the promise is rejected with an error, the request handler will:
            * `console.error` the error returned
            * alter the error to a user error if `NODE_ENV` is not set to `development`
            * set the error `statusCode` to `500`
            * set the `app.db.error` to the error
            * return `next( app.db.error )`

## installation
```javascript
npm install http-server-request-handlers-db
```

## api
```javascript
/**
 * @param {IncomingMessage} req
 * @param {Object} req.app
 *
 * @param {ServerResponse} res
 * @param {Function} next
 *
 * @returns {undefined}
 */
function dbRequestHandler( req, res, next )
```

## usage
### basic
```javascript
var dbRequestHandler = require( 'http-server-request-handlers-db' )

function route( router ) {
  router.get( '/', [
      dbRequestHandler,
      require( '../controllers/home/get' )
    ]
  )
}
```

## license
[MIT License][mit-license]

[mit-license]: https://raw.githubusercontent.com/http-server-request-handlers/db/master/license.txt
[npm-image]: https://img.shields.io/npm/v/http-server-request-handlers-db.svg
[npm-url]: https://www.npmjs.com/package/http-server-request-handlers-db
[nsp-image]: https://nodesecurity.io/orgs/http-server-request-handlers/projects/0b141b84-67d6-4648-9b96-44ac8836f26c/badge
[nsp-url]: https://nodesecurity.io/orgs/http-server-request-handlers/projects/0b141b84-67d6-4648-9b96-44ac8836f26c
[travis-image]: https://travis-ci.org/http-server-request-handlers/db.svg?branch=master
[travis-url]: https://travis-ci.org/http-server-request-handlers/db
