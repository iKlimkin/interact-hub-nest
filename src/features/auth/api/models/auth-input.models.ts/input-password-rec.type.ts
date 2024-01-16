import { Matches } from "class-validator";
import { emailMatches } from "src/infra/validation.constants";

export type PasswordRecoveryType = {
  newPassword: string;
  recoveryCode: string;
};

export type InputEmail = {
  email: string;
};

export class InputRecoveryEmailModel {
  /**
   * email of the recovery account
   */
  @Matches(emailMatches)
  email: string;

}