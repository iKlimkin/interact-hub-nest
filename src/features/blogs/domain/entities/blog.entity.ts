import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAccounts } from '../../../admin/domain/entities/user-account.entity';
import { Posts } from '../../../posts/domain/entities/post.entity';

@Entity()
export class Blogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  website_url: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  is_membership: Boolean;

  @ManyToOne(() => UserAccounts, (u) => u.blogs)
  userAccount: UserAccounts;

  @OneToMany(() => Posts, (p) => p.blog)
  posts: Posts[];
}
