import { Injectable } from '@nestjs/common';
import { UuidManager } from 'src/common/classes/uuid-manager.class';
import { validate, v4 as uuidv4 } from 'uuid';

@Injectable()
export class UuidService extends UuidManager {
  validate(uuid: string): boolean {
    return validate(uuid);
  }

  generate(): string {
    return uuidv4();
  }
}
