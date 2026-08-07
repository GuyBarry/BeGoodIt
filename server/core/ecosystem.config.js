module.exports = {
  apps: [
    {
      name: 'begoodit-application',
      script: './dist/app.js',
      node_args: '--env-file=.env.production --no-deprecation',
    },
  ],
};
