import { InjectRepository } from "@nestjs/typeorm";
import { SA } from "../domain/entities/sa.entity";
import { Repository } from "typeorm";
import { Wallet } from "../domain/entities/user-account.entity";

export class UsersTypeORMRepository {
    constructor(
        @InjectRepository(SA)
        private readonly usersRepository: Repository<SA>,
        @InjectRepository(Wallet)
        private readonly walletsRepository: Repository<Wallet>
    ){}

    async createUser(user: any) {
        return this.usersRepository.save(user)
    }

    async createWallet (wallet: Wallet) {
        return this.walletsRepository.save(wallet);
    }
}