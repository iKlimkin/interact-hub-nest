import jwt from 'jsonwebtoken';
import settings from '../settings/jwt.settings';
import { v4 as uuidv4 } from 'uuid';
import {
  JwtTokens,
  VerifyTokensType,
  TokensMeta,
  Payload,
} from 'src/features/auth/api/models/jwt.models';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtService {
  createJWT(userId: string): JwtTokens {
    const deviceId = uuidv4();
    const accessToken = jwt.sign({ userId, deviceId }, settings.jwt_secret, {
      expiresIn: '10h',
    });
    const refreshToken = jwt.sign(
      { userId, deviceId },
      settings.refresh_secret,
      { expiresIn: '20m' },
    );

    return {
      refreshToken,
      accessToken,
    };
  }

  async getUserInfoByToken(
    inputToken: VerifyTokensType,
  ): Promise<TokensMeta | null> {
    try {
      const decodedData = jwt.verify(inputToken.token, inputToken.secret);

      return decodedData as TokensMeta;
    } catch (err) {
      console.error(`Troubleshoots with ${inputToken.tokenType}: `, err);
      return null;
    }
  }

  getUserPayloadByToken(token: string): Payload | null {
    try {
      return jwt.decode(token) as Payload;
    } catch (error) {
      console.error(`Troubleshoots with getting user's payload`, error);
      return null;
    }
  }

  updateUserTokens(userId: string, deviceId: string): JwtTokens {
    const accessToken = jwt.sign({ userId, deviceId }, settings.jwt_secret, {
      expiresIn: '10m',
    });
    const refreshToken = jwt.sign(
      { userId, deviceId },
      settings.refresh_secret,
      { expiresIn: '20m' },
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
