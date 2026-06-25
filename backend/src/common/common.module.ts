import { Module } from '@nestjs/common';
import { UuidService } from './adapters/uuid/uuid.service';
import { BcryptService } from './adapters/hash-service/bcrypt.service';
import { MailerService } from './services/mailer/mailer.service';
import { HashService } from './classes/hash-service.class';
import { UuidManager } from './classes/uuid-manager.class';

@Module({
  providers: [
    MailerService,
    {
      provide: HashService,
      useClass: BcryptService,
    },
    {
      provide: UuidManager,
      useClass: UuidService,
    },
  ],
  exports: [HashService, UuidManager, MailerService],
})
export class CommonModule {}
