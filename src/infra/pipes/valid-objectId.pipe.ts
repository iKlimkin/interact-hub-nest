import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    try {
      const isValid = Types.ObjectId.isValid(value)
      return value
      // return new Types.ObjectId(value)
    } catch (error) {
      throw new NotFoundException({error, value})
    }   
  }
}
