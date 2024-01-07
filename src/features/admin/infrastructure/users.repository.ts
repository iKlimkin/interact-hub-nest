import { Injectable } from "@nestjs/common";
import { UserAccount, UserAccountDocument, UserAccountModelType } from "../userAccount.schema";
import { InjectModel } from "@nestjs/mongoose";
import { UserAccountType, UserAccountDBType } from "src/features/auth/api/models/auth.output.models/auth.output.models";

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(UserAccount.name) private UserAccountModel: UserAccountModelType,
      ) {}
      
    async create(
        userAdminDto: Readonly<UserAccountType>
    ): Promise<UserAccountDocument> {
      try {
        const createdUserAdmin = await this.UserAccountModel.create(userAdminDto)

        return createdUserAdmin
      } catch (error) {
        throw new Error(`While creating the user occured some errors: ${error}`);
      }
    }
  
    async getUserById(userId: string): Promise<UserAccountDBType | null> {
      try {
        const foundUser = await this.UserAccountModel
          .findById(userId)
        
        if (!foundUser) return null;
  
        return { 
          ...foundUser
        };
      } catch (e) {
        throw new Error(`There're something during find user by id: ${e}`);
      }
    }
  
    async deleteUser(searchId: string): Promise<boolean> {
      try {
        const result = await this.UserAccountModel.findByIdAndDelete(searchId);
  
        return !!result
      } catch (error) {
        throw new Error(`there were some problems during removal user, ${error}`);
      }
    }
  };
  