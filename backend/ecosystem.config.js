module.exports = {
  apps: [
    {
      name: "vacunacion",
      script: "index.js",
      cwd: "C:/inetpub/wwwroot/Vacunas/backend",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
