import { Injectable } from '@nestjs/common';
import { HashService } from 'src/common/classes/hash-service.class';
import { hash, genSalt, compare } from 'bcrypt';

@Injectable()
export class BcryptService extends HashService {
  async hash(password: string): Promise<string> {
    const salt = await genSalt(10);
    return hash(password, salt);
  }
  compare(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }
}
