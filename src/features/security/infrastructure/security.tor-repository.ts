import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OutputId } from '../../../domain/likes.types';
import { UserSessionDto } from '../../auth/api/models/user-account.sql.dto';
import { UserSession } from '../domain/entities/security.entity';

@Injectable()
export class SecurityTORRepository {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessions: Repository<UserSession>,
  ) {}
  async save(sessionDto: Readonly<UserSessionDto>): Promise<OutputId | null> {
    try {
      const result = await this.userSessions.save(sessionDto);
      console.log({result});

      return {
        id: result.id,
      };
    } catch (error) {
      console.error(`
      Database fails operate with create session ${error}`);
      return null;
    }
  }

  async updateIssuedToken(
    deviceId: string,
    issuedAt: Date,
    exp: Date,
  ): Promise<boolean> {
    try {
      const result = await this.userSessions.update(
        { device_id: deviceId },
        { rt_issued_at: issuedAt, rt_expiration_date: exp },
      );

      return result.affected !== 0;
    } catch (error) {
      console.error(
        `Database fails operate with update token's issued at ${error}`,
      );
      return false;
    }
  }

  async deleteSpecificSession(deviceId: string): Promise<boolean> {
    try {

      const sessionToDelete = await this.userSessions.findOneBy({ device_id: deviceId })

      if (!sessionToDelete) return false

      const result = await this.userSessions.remove(sessionToDelete);

      return !!result;
    } catch (error) {
      console.error(
        `Database fails operate with delete specific session ${error}`,
      );
      return false;
    }
  }

  // async deleteOtherUserSessions(deviceId: string): Promise<boolean> {
  //   try {
  //     const deleteManyQuery = `
  //       DELETE
  //       FROM user_sessions
  //       WHERE device_id <> $1
  //     `;

  //     const result = await this.dataSource.query(deleteManyQuery, [deviceId]);

  //     return result[1] > 0;
  //   } catch (error) {
  //     console.error(
  //       `Database fails operate with delete other sessions ${error}`,
  //     );
  //     return false;
  //   }
  // }
}
