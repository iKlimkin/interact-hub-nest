import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Posts } from '../../../posts/domain/entities/post.entity';
import { UserAccounts } from '../../../admin/domain/entities/user-account.entity';
import { CommentReactions } from './comment-reactions.entity';
import { CommentReactionCounts } from './comment-reaction-counts.entity';

@Entity()
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  post_id: string;

  @Column()
  user_id: string;

  @Column()
  user_login: string;

  @Column()
  content: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Posts, (p) => p.comments)
  @JoinColumn()
  post: Posts;

  @ManyToOne(() => UserAccounts, (ua) => ua.comments)
  @JoinColumn()
  userAccount: UserAccounts;

  @OneToMany(() => CommentReactions, (cr) => cr.comment)
  @JoinColumn()
  commentReactions: CommentReactions[];

  @OneToOne(() => CommentReactionCounts)
  @JoinColumn()
  commentReactionCounts: CommentReactionCounts;
}
