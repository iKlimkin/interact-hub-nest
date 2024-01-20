import { iSValidField } from '../../../../infra/decorators/transform/is-valid-string';
import { contentPostLength } from '../../../../infra/validation.constants';

export class InputContentModel {
  /**
   *  current content
   */
  @iSValidField(contentPostLength)
  content: string;
}

export type InputCommentModel = {
  content: string;
  userId: string;
  postId: string;
};
