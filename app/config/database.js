module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'mysql',
        host: env('DATABASE_HOST', '10.39.93.21'),
        port: env.int('DATABASE_PORT', 3307),
        database: env('DATABASE_NAME', 'facebook-partner'),
        username: env('DATABASE_USERNAME', 'root'),
        password: env('DATABASE_PASSWORD', '8?PP6x~1sZZY#<%x'),
        ssl: env.bool('DATABASE_SSL', false),
      },
      options: {}
    },
    riviu: {
      connector: 'bookshelf',
      settings: {
        client: 'mysql',
        host: env('DATABASE_HOST', '10.39.93.66'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'lixibook'),
        username: env('DATABASE_USERNAME', 'lixibook'),
        password: env('DATABASE_PASSWORD', 'oS4+N9zn'),
        ssl: env.bool('DATABASE_SSL', false),
      },
      options: {}
    },
  },
});
