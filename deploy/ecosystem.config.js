/**
 * PM2 Ecosystem Configuration
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save && pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'mspi-api',
      cwd: '/var/www/mspi/apps/api',
      script: 'node',
      args: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/var/log/pm2/mspi-api-error.log',
      out_file: '/var/log/pm2/mspi-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'mspi-web',
      cwd: '/var/www/mspi/apps/web',
      script: 'node',
      args: 'node_modules/.bin/next start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/mspi-web-error.log',
      out_file: '/var/log/pm2/mspi-web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'mspi-admin',
      cwd: '/var/www/mspi/apps/admin',
      script: 'node',
      args: 'node_modules/.bin/next start -p 3001',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/var/log/pm2/mspi-admin-error.log',
      out_file: '/var/log/pm2/mspi-admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
