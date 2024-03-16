import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  JoinTable,
  OneToMany,
  Unique,
} from 'typeorm';
import { SA } from './sa.entity';
import { Blogs } from '../../../blogs/domain/entities/blog.entity';
import { Comments } from '../../../comments/domain/entities/comments.entity';
import { UserSessions } from '../../../security/domain/entities/security.entity';
import { PostReactions } from '../../../posts/domain/entities/post-reactions.entity';
import { CommentReactions } from '../../../comments/domain/entities/comment-reactions.entity';

@Entity()
export class UserAccounts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  password_salt: string;

  @Column()
  password_hash: string;

  @Column()
  confirmation_code: string;

  @Column()
  confirmation_expiration_date: Date;

  @Column()
  is_confirmed: boolean;

  @Column({ nullable: true })
  password_recovery_code: string;

  @Column({ nullable: true })
  password_recovery_expiration_date: Date;

  @OneToMany(() => Blogs, (b) => b.userAccount)
  blogs: Blogs[];

  @OneToMany(() => Comments, (c) => c.userAccount)
  comments: Comments[];

  @OneToMany(() => UserSessions, (us) => us.userAccount)
  userSessions: UserSessions[];

  @OneToMany(() => PostReactions, (pr) => pr.userAccount)
  postReactions: PostReactions[];

  @OneToMany(() => CommentReactions, (cr) => cr.userAccount)
  commentReactions: CommentReactions[];
}

@Entity()
export class UserProfile {
  @PrimaryColumn()
  saId: string;

  @Column()
  user_login: string;

  @Column()
  user_email: string;

  @OneToOne(() => SA, (sa) => sa.userProfile)
  @JoinColumn()
  sa: SA;
}

export type Currencies = 'USD' | 'BTC' | 'BYN';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  currency: Currencies;

  @Column()
  balance: number;

  @Column()
  ownerId: number;

  @ManyToOne(() => SA, (sa) => sa.wallets)
  owner: SA;

  @OneToMany(() => WalletSharing, (ws) => ws.wallet)
  sas: WalletSharing[];
}

@Entity()
@Unique('one_wallet_for_one_user', ['walletId', 'userId'])
export class WalletSharing {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  walletId: string;

  @ManyToOne(() => Wallet, (w) => w.sas)
  wallet: Wallet;

  @ManyToOne(() => SA, (sa) => sa.walletsSharing)
  sa: SA;

  @Column()
  userId: string;

  @Column()
  limit: number;

  @Column()
  title: string;

  @Column()
  expirationDate: Date;

  @Column()
  addedAt: Date;
}
