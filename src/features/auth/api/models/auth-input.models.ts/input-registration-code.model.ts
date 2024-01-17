import { iSValidField } from "src/infra/decorators/transform/is-valid-string";
import { frequentLength } from "src/infra/validation.constants";

export class InputRegistrationCodeModel {
    @iSValidField(frequentLength)
    code: string
}