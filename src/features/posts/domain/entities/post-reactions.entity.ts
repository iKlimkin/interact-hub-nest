import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Posts } from './post.entity';
import { UserAccounts } from '../../../admin/domain/entities/user-account.entity';

@Entity()
export class PostReactions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Posts, (p) => p.postReactions)
  @JoinColumn()
  post: Posts;

  @ManyToOne(() => UserAccounts, (ua) => ua.postReactions)
  @JoinColumn()
  userAccount: UserAccounts;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  liked_at: Date;
}
