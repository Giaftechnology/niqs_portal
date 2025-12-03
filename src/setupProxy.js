const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Ensure preflight is handled in dev and add permissive CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With, Accept, Origin');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.andjemztech.com',
      changeOrigin: true,
      secure: false,
      // do not send x-forwarded-* headers; some WAFs block localhost origins
      logLevel: 'debug',
      cookieDomainRewrite: '',
      onProxyReq: (proxyReq, req, res) => {
        try {
          // remove headers that can trigger WAF/CORS policies
          proxyReq.removeHeader && proxyReq.removeHeader('origin');
          proxyReq.removeHeader && proxyReq.removeHeader('referer');
          proxyReq.removeHeader && proxyReq.removeHeader('x-forwarded-host');
          proxyReq.removeHeader && proxyReq.removeHeader('x-forwarded-proto');
          proxyReq.removeHeader && proxyReq.removeHeader('x-forwarded-for');
          proxyReq.removeHeader && proxyReq.removeHeader('sec-fetch-site');
          proxyReq.removeHeader && proxyReq.removeHeader('sec-fetch-mode');
          proxyReq.removeHeader && proxyReq.removeHeader('sec-fetch-dest');
          proxyReq.removeHeader && proxyReq.removeHeader('sec-ch-ua');
          proxyReq.removeHeader && proxyReq.removeHeader('sec-ch-ua-mobile');
          proxyReq.removeHeader && proxyReq.removeHeader('sec-ch-ua-platform');
          // mimic Postman UA which you confirmed works
          proxyReq.setHeader('user-agent', 'PostmanRuntime/7.40.0');
        } catch {}
      },
      onProxyRes: (proxyRes, req) => {
        proxyRes.headers['access-control-allow-origin'] = '*';
        proxyRes.headers['access-control-allow-credentials'] = 'true';
        proxyRes.headers['access-control-allow-methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
        proxyRes.headers['access-control-allow-headers'] = 'Authorization, Content-Type, X-Requested-With, Accept, Origin';
        // eslint-disable-next-line no-console
        console.log(`[proxy] ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode}`);
      },
      onError(err, req, res) {
        // eslint-disable-next-line no-console
        console.error('[proxy] error', err);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Proxy error', error: String(err && err.message || err) }));
      }
    })
  );
};
