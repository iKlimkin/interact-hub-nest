import { JwtPayload } from "jsonwebtoken";

export interface Payload extends JwtPayload {
    userId: string
    deviceId: string
    iat: number
    exp: number
  }

export type ExpiredTokensType = {
    refreshToken: string;
};

export type VerifyTokensType = {
    token: string;
    secret: string;
    tokenType: string
} 

export type TokensMeta = {
    userId: string
    deviceId: string
    iat: number
    exp: number
}

export type JwtTokens = {
    refreshToken: string;
    accessToken: string
}