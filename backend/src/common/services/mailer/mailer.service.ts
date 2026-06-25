import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendEmail(email: string, subject: string, html: string) {
    const response = await this.mailerService.sendMail({
      to: email,
      subject,
      html,
    });
    return response;
  }
}
