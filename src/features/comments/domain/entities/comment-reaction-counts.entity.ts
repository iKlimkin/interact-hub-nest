import {
  Entity,
  OneToOne,
  JoinColumn,
  Column,
  IntegerType,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comments } from './comments.entity';

@Entity()
export class CommentReactionCounts {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Comments)
  @JoinColumn()
  comment: Comments;

  @Column({ type: 'integer' })
  likes_count: number;

  @Column({ type: 'integer' })
  dislikes_count: number;
}
