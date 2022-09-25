module.exports = ({ env }) => ({
  settings: {
    cache: {
      enabled: true,
      maxAge: 3600000,
      withStrapiMiddleware: true,
      clearRelatedCache: true,
      logs:true,
      models: [
        {
          model: 'posts',
          injectDefaultRoutes: false,
          maxAge: 3600000,
          hitpass: false,
          routes: [
            '/posts',
            '/posts/:id',
            '/total-post',
            '/user-statistic'
          ]
        },
        {
          model: 'groups',
          injectDefaultRoutes: false,
          maxAge: 3600000,
          hitpass: false,
          routes: [
            '/groups',
            '/groups-post',
            '/groups-user'
          ]
        },
      ]
    },
  	cors: {
      origin: ['http://localhost:1345', 'https://partner-api.riviu.co'],
    },
    gzip: {
      enabled: true,
      options: {
        br: false
      }
    },
    public: {
      maxAge: 1000 * 3600 * 24 * 30, // cache 30days
      path: './public'
    }
  }
})