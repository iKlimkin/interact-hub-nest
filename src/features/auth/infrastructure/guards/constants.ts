export const jwtConstants = {
    jwt_access_secret: process.env.JWT_SECRET || 'JWT_SECRET_KEY',
    refresh_secret: process.env.REFRESH_JWT_SECRET || 'REFRESH_SECRET_KEY',
}

export const basicConstants = {
    userName: process.env.HTTP_BASIC_USER || "admin",
    userPassword: process.env.HTTP_BASIC_PASS || "qwerty"
}
  
