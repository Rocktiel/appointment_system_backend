import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '../_common/strategies/jwt.strategy';
import { User } from 'src/_common/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import * as dotenv from 'dotenv'; // Buna gerek yok, ConfigModule hallediyor
// dotenv.config(); // Buna da gerek yok

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([User]),
    PassportModule,
    // JwtModule'ü sadece import ediyoruz, çünkü AppModule'de zaten global olarak yapılandırıldı.
    // Burada tekrar secret veya signOptions belirtmeye gerek yok.
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // JwtModule'ü dışa aktarmak, JwtService'in diğer modüllerde de kullanılabilmesini sağlar.
  exports: [AuthService],
})
export class AuthModule {}
