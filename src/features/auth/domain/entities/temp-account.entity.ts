import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TemporaryUserAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  recovery_code: string;

  @Column()
  code_expiration_time: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
