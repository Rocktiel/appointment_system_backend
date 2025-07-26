import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      // Denemek için Ethereal kullanıldı
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true ise 465 portu, false ise diğerleri (587)
        auth: {
          user: 'mazie.collier67@ethereal.email',
          pass: 'mmx6eGERUYprtyKz7V',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>', // Varsayılan gönderen adresi
      },
      template: {
        dir: join(__dirname, 'templates'), // Email şablonlarının yolu
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService], // MailService'i diğer modüllerde kullanabilmek için dışa aktarın
})
export class MailModule {}
