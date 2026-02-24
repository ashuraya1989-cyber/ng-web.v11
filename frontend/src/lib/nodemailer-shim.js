// Browser shim for nodemailer.
// nodemailer is a server-only package used exclusively in Vercel API functions (/api/).
// This empty module prevents webpack from bundling Node.js internals into the browser build
// and eliminates the DEP0169 url.parse() deprecation warning.
module.exports = {};
