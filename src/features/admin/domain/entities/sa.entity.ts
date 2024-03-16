import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { UserProfile, Wallet, WalletSharing } from './user-account.entity';

@Entity()
export class SA {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @OneToOne(() => UserProfile, (u) => u.sa)
  userProfile: UserProfile;

  @OneToMany(() => Wallet, w => w.owner)
  wallets: Wallet[]

  @OneToMany(() => WalletSharing, ws => ws.wallet)
  walletsSharing: WalletSharing[]
}
