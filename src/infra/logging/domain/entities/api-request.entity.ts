import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ApiRequests {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ip: string;

  @Column()
  url: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
