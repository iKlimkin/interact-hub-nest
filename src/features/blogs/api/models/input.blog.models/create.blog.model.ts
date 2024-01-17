import { IsNotEmpty, Length, Matches } from 'class-validator';
import {
  descriptionLength,
  nameLength,
  urlLength,
  urlMatching,
} from 'src/infra/validation.constants';
import { iSValidField } from '../../../../../infra/decorators/transform/is-valid-string';

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
  @iSValidField(nameLength)
  name: string;

  /**
   * description of the blog.
   */
  @iSValidField(descriptionLength)
  description: string;

  /**
   * websiteUrl for the blog.
   */
  @Matches(urlMatching) // @IsUrl()
  @IsNotEmpty()
  @Length(urlLength.min, urlLength.max)
  websiteUrl: string;
}
