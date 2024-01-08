import { iSValidString } from 'src/features/blogs/api/models/is-valid-string';
import {
  blogIdLength,
  contentLength,
  frequentLength,
  titleLength
} from 'src/features/infra/validation.constants';

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
  blogId: string;
}
