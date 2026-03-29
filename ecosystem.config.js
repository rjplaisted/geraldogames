module.exports = {
  apps: [
    {
      name: "kidgames",
      script: "./server/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
