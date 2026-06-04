const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://122.36.99.66:8080',
      changeOrigin: true,
    })
  );
};