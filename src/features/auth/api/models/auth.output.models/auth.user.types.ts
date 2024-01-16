import { iSValidString } from "src/infra/decorators/transform/is-valid-string";
import { frequentLength, passwordLength } from "src/infra/validation.constants";

export type LoginCredentials = {
  loginOrEmail: string;
  password: string;
};

export class InputCredentialsModel {
  /**
   * loginOrEmail of the user account
   */
  @iSValidString(frequentLength)
  loginOrEmail: string;

  /**
   * password of the user account.
   */
  @iSValidString(passwordLength)
  password: string;
}

export type LoginOrEmailType = {
  login?: string | null;
  email?: string | null;
  loginOrEmail?: string | null;
};

export type AuthUserType = {
  login: string;
  email: string;
  password: string;
};
