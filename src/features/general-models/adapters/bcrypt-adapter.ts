import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt'

interface HashAndSalt {
    passwordSalt: string;
    passwordHash: string;
}

interface BcryptInterface  {
    createHash: (password: string) => Promise<HashAndSalt>
    compareAsync: (password: string, passwordHash: string) => Promise<boolean>
}
  

@Injectable()
export class BcryptAdapter implements BcryptInterface {

    async createHash(password: string) {
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, passwordSalt);
        return {
            passwordSalt, 
            passwordHash
        }
    }

    compareAsync = async (password: string , passwordHash: string) => await bcrypt.compare(password, passwordHash)

}

export const bcryptAdapter = new BcryptAdapter()

