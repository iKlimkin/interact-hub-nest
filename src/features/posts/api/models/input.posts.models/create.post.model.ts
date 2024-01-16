import { iSValidString } from 'src/infra/decorators/transform/is-valid-string';
import { BlogIdIsExist } from 'src/infra/decorators/validate/valid-blogId';
import {
  blogIdLength,
  contentLength,
  frequentLength,
  titleLength,
} from 'src/infra/validation.constants';

export type CreatePostByBlog = Omit<CreatePostModel, 'blogId'>;

export type CreatePostModel = {
  /**
   *  post's title
   */
  title: string;

  /**
   * shortDescription of the post
   */
  shortDescription: string;

  /**
   * content of existing post
   */
  content: string;

  /**
   * search blog id
   */
  blogId: string;
};

export class InputPostModel {
  /**
   *  post's title
   */
  @iSValidString(titleLength)
  title: string;

  /**
   * shortDescription of the post
   */
  @iSValidString(frequentLength)
  shortDescription: string;

  /**
   * content of existing post
   */
  @iSValidString(contentLength)
  content: string;

  /**
   * search blog id
   */
  @iSValidString(blogIdLength)
  @BlogIdIsExist('blogId doesn\'t exist')
  blogId: string;
}
