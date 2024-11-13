import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export const saltRounds = 10;

@Injectable()
export class EncryptionService {
  public async getHash(secret: string): Promise<string> {
    return await bcrypt.hash(secret, saltRounds);
  }

  public async compareHash(secret: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(secret, hash);
  }
}
