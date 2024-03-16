import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blogs } from '../../../blogs/domain/entities/blog.entity';
import { Comments } from '../../../comments/domain/entities/comments.entity';
import { PostReactions } from './post-reactions.entity';
import { PostReactionCounts } from './post-reaction-counts.entity';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  short_description: string;

  @Column()
  website_url: string;

  @Column()
  content: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Blogs, (b) => b.posts)
  @JoinColumn()
  blog: Blogs;

  @OneToMany(() => Comments, (c) => c.post)
  comments: Comments[];

  @OneToMany(() => PostReactions, (pr) => pr.post)
  @JoinColumn()
  postReactions: PostReactions[];

  @OneToOne(() => PostReactionCounts)
  @JoinColumn()
  postReactionCounts: PostReactionCounts;
}
