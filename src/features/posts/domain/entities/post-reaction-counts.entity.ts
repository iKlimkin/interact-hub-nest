import {
  Column,
  Entity,
  IntegerType,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Posts } from './post.entity';

@Entity()
export class PostReactionCounts {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Posts)
  @JoinColumn()
  post: Posts;

  @Column({ type: 'integer' })
  likes_count: number;

  @Column({ type: 'integer' })
  dislikes_count: number;
}
