module.exports = {
  "/activiti-app": {
    "target": "http://172.22.1.74:8080", // desa http://10.113.97.102:8080 
    "secure": false,
    "pathRewrite": {
      "^/activiti-app/activiti-app": ""
    },
    "changeOrigin": true
  },
  "/alfresco": {
    "target": "http://172.22.1.70:8080", // desa http://10.113.97.41:8080
    "secure": false,
    "pathRewrite": {
      "^/alfresco/alfresco": ""
    },

  /*   "changeOrigin": true,
    // workaround for REPO-2260
    onProxyRes: function (proxyRes, req, res) {
      const header = proxyRes.headers['www-authenticate'];
      if (header && header.startsWith('Basic')) {
          proxyRes.headers['www-authenticate'] = 'x' + header;
      }
    } */
  },
  "/WSRegulacionRest": {
    "target": "http://172.22.1.74:8080",// desa http://10.113.97.102:8080
    "secure": false,
    "changeOrigin": true
  },
  "/WS_BPM_REST": {
    "target": "http://172.22.1.74:8080", // desa http://10.113.97.102:8080
    "secure": false,
    "changeOrigin": true
  },
/*   "/adf": {
    "target": "http://localhost:3000",
    "pathRewrite": {
      "^/adf": ""
    },
    "secure": false,
    "changeOrigin": true
  } */
  
  
};
/* 
 module.exports = {
  "/alfresco": {
    "target": "http://172.22.1.105:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/activiti-app": {
    "target": "http://172.22.1.106:8080",
    "secure": false,
    "changeOrigin": true
  }
};  */
