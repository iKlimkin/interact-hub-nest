import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';


@Injectable()
export class NumberPipe implements PipeTransform {
  
    transform(value: string, metadata: ArgumentMetadata) {
    
    if (!ObjectId.isValid(value)) {
      throw new BadRequestException('Invalid id');
    }
    
    return true;
  }
}
