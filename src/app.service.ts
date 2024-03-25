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

  async seedData(ownerId: number, dto: any) {

  }
}
