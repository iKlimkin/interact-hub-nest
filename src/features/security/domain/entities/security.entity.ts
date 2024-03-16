import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserAccounts } from '../../../admin/domain/entities/user-account.entity';

@Entity()
export class UserSessions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ip: string;

  @Column()
  user_id: string;

  @Column()
  user_agent_info: string;

  @Column()
  device_id: string;

  @Column()
  refresh_token: string;

  @Column()
  rt_issued_at: Date;

  @Column()
  rt_expiration_date: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => UserAccounts, ua => ua.userSessions)
  userAccount: UserAccounts
}
