import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

const frontendUrl = process.env.FRONTEND_URL_LOCAL;
@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(email: string, code: string): Promise<void> {
    const url = `${frontendUrl}/confirmEmail?email=${encodeURIComponent(email)}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Doğrulama Kodunuz',
      template: 'confirmation', // src/mail/templates/confirmation.hbs dosyasını kullanacak
      context: {
        name: email.split('@')[0],
        code,
        url,
      },
    });
  }

  // Gelecekte diğer email tipleri için buraya metodlar eklenecek (örneğin: şifre sıfırlama, bildirimler)
  // async sendPasswordReset(email: string, resetLink: string): Promise<void> { /* ... */ }
}
