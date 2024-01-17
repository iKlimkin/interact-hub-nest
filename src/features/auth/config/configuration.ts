import { registerAs } from "@nestjs/config";

export const getAuthConfiguration = registerAs('auth', () => ({
    type: process.env.AUTH_TYPE ?? 'OATH2'
  }));

  
export type AuthConfigurationType = { auth: ReturnType<typeof getAuthConfiguration> }
