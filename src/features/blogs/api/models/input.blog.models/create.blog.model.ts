import { IsNotEmpty, Length, Matches } from 'class-validator';
import {
  descriptionLength,
  nameLength,
  urlLength,
  urlMatching,
} from 'src/infra/validation.constants';
import { iSValidString } from '../../../../../infra/decorators/transform/is-valid-string';

export type CreateBlogModelType = {
  /**
   * name of the blog
   */
  name: string;

  /**
   * description of the blog.
   */
  description: string;

  /**
   * websiteUrl for the blog.
   */
  websiteUrl: string;
};

export class InputBlogModel {
  /**
   * name of the blog
   */
  @iSValidString(nameLength)
  name: string;

  /**
   * description of the blog.
   */
  @iSValidString(descriptionLength)
  description: string;

  /**
   * websiteUrl for the blog.
   */
  @Matches(urlMatching) // @IsUrl()
  @IsNotEmpty()
  @Length(urlLength.min, urlLength.max)
  websiteUrl: string;
}
