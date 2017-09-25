/*!
 * Connect - session - Store
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */


/**
 * Module dependencies.
 * @private
 */

const Cookie = require('./cookie')
const EventEmitter = require('events').EventEmitter
const Session = require('./session')

/**
 * Store class
 * @public
 */

class Store extends EventEmitter {
  constructor() {
    super();
  }

  /**
   * Re-generate the given requests's session.
   *
   * @param {IncomingRequest} req
   * @return {Function} fn
   * @api public
   */
  regenerate(req, fn) {
    const destroyCb = (err) => {
      self.generate(req);
      fn(err);
    };
    this.destroy(req.sessionID, destroyCb.bind(this));
  }

  /**
   * Load a `Session` instance via the given `sid`
   * and invoke the callback `fn(err, sess)`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */
  load(sid, fn) {
    const getCb = (err, sess) => {
      if (err) return fn(err);
      if (!sess) return fn();
      let req = { sessionID: sid, sessionStore: this };
      fn(null, this.createSession(req, sess))
    };
    this.get(sid, getCb.bind(this));
  }

  /**
   * Create session from JSON `sess` data.
   *
   * @param {IncomingRequest} req
   * @param {Object} sess
   * @return {Session}
   * @api private
   */
  createSession(req, sess) {
    const expires = sess.cookie.expires,
      orig = sess.cookie.originalMaxAge;
    sess.cookie = new Cookie(sess.cookie);
    if ('string' == typeof expires) 
      sess.cookie.expires = new Date(expires);
    sess.cookie.originalMaxAge = orig;
    req.session = new Session(req, sess);
    return req.session;
  }
}

/**
 * Module exports.
 * @public
 */

module.exports = Store;