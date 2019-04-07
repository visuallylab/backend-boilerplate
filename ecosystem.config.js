module.exports = {
  apps: [
    {
      name: 'app', // change your name
      script: './build/app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: [
        '-r',
        'tsconfig-paths/register',
        '-r',
        'source-map-support/register',
      ],
      env: {
        TS_NODE_PROJECT: 'tsconfig.prod.json',
      },
    },
  ],
};
