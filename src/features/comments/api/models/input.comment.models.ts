import { IsNotEmpty, IsString } from 'class-validator';
import { iSValidField } from '../../../../infra/decorators/transform/is-valid-string';
import { contentPostLength } from '../../../../infra/validation.constants';
import { isValidObjectId } from 'mongoose';

export class InputContentModel {
  /**
   *  current content
   */
  @iSValidField(contentPostLength)
  content: string;
}

export type InputCommentModelType = {
  content: string;
  userId: string;
  postId: string;
};

export class InputCommentModel {
  @iSValidField(contentPostLength)
  content: string;
  
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  postId: string;
};
