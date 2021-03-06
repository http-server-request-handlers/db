/* eslint consistent-return: off */
/* eslint no-invalid-this: off */
/* eslint no-process-env: off */
/* eslint no-param-reassign: off */
/* eslint no-underscore-dangle: off */

'use strict'

/**
 * module dependencies
 */
var DatabaseError = require( 'custom-errors-database' )

/**
 * @param {IncomingMessage} req
 * @param {Object} req.app
 *
 * @param {ServerResponse} res
 * @param {Function} next
 *
 * @returns {undefined}
 */
function dbRequestHandler( req, res, next ) {
  /**
   * @type {Object}
   *
   * @property {Object} [db]
   * @property {Error} [db.error]
   * @property {setupDb} [db.setupDb]
   *
   * @property {boolean} [debug]
   */
  var app = req.app

  if ( app.debug ) {
    console.log( '[debug]', new Date().toGMTString(), 'dbRequestHandler()' )
  }

  if ( !app.db ) {
    return next()
  }

  if ( !app.db.error ) {
    return next()
  }

  if ( typeof app.setupDb !== 'function' ) {
    return next()
  }

  if ( typeof app.db._readyState !== 'undefined' && app.db._readyState !== 0 ) {
    return next()
  }

  console.log( '[warn]', new Date().toGMTString(), 'attempting to reconnect to mongodb://%host:%port/%database'
    .replace( '%host', app.db.host )
    .replace( '%port', app.db.port )
    .replace( '%database', app.db.name )
  )

  app.setupDb()
    .then(
      /**
       * @param {Object} db
       * @returns {*}
       */
      function ( db ) {
        app.db = db;

        return next()
      }
    )
    .catch(
      /**
       * @param {Error} err
       * @returns {*}
       */
      function ( err ) {
        if ( process.env.NODE_ENV !== 'development' ) {
          console.error( err )
          err = new DatabaseError( err.code, 'please try again later ...' )
        }

        err.statusCode = err.statusCode || 500;

        app.db = {
          error: err
        };

        return next( err )
      }
    );
}

module.exports = dbRequestHandler
