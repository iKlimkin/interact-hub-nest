import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AppService {
  constructor(
    // @InjectRepository(UsersTypeORMRepository)
    // private readonly usersRepo: UsersTypeORMRepository
  ) {}

  getHello(): string {
    return 'test';
  }

  // async createWallet(ownerId: number, dto: any) {
  //   const wallet = new Wallet();
  //   wallet.ownerId = ownerId;
  //   wallet.currency = dto.currency;
  //   wallet.balance = 0;
  //   wallet.title = dto.title;
  //   // return this.usersRepo.createWallet(wallet)
  // }
}
