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
  Unique,
} from 'typeorm';

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
