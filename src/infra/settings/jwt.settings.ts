export default {
  jwt_secret: process.env.JWT_SECRET || 'JWT_SECRET_KEY',
  refresh_secret: process.env.REFRESH_JWT_SECRET || 'REFRESH_SECRET_KEY',
};
