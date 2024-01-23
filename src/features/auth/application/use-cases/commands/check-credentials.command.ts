import { InputCredentialsModel } from '../../../api/models/auth-input.models.ts/input-credentials.model';

export class CheckCredentialsCommand {
  constructor(public inputData: InputCredentialsModel) {}
}
