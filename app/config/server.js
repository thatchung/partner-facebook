module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1345),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '9a707846d560532e9eea1d56fd885a7f'),
    },
  },
  cron: { enabled: true }
});
