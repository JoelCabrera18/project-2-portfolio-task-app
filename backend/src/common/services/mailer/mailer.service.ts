import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly mailerService: NestMailerService) {}

  async sendEmail(email: string, subject: string, html: string) {
    try {
      const response = await this.mailerService.sendMail({
        to: email,
        subject,
        html,
      });
      return response;
    } catch (error) {
      this.logger.error(`Failed to send email to ${email} — subject: ${subject}`, error instanceof Error ? error.stack : '');
      throw error;
    }
  }
}
