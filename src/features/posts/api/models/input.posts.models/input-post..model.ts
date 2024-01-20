import { IsEnum } from 'class-validator';
import { likesStatus } from '../../../../../infra/likes.types';

export class InputLikeStatusModel {
  @IsEnum(likesStatus, { message: `Invalid like's status value` })
  likeStatus: likesStatus;
}
