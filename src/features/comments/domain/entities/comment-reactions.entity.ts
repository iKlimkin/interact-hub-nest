import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserAccounts } from '../../../admin/domain/entities/user-account.entity';
import { Comments } from './comments.entity';

@Entity()
export class CommentReactions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Comments, (c) => c.commentReactions)
  comment: Comments;

  @ManyToOne(() => UserAccounts, (ua) => ua.commentReactions)
  userAccount: UserAccounts;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  liked_at: Date;
}
