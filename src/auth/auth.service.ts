import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterRequestDto } from './dto/request/RegisterRequest.dto';
import { UserTypes } from 'src/_common/enums/UserTypes.enums';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/_common/typeorm';
import { Repository } from 'typeorm';
import { ResponseMessages } from 'src/_common/enums/ResponseMessages.enum';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/_common/payloads/jwt.payload';
import { JwtService } from '@nestjs/jwt';
import { LoginRequestDto } from './dto/request/LoginRequest.dto';
import { randomInt } from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly authRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(
    body: RegisterRequestDto,
  ): Promise<{ user: User; refreshToken: string; accessToken: string }> {
    const isAvailable = await this.isEmailAvailableForUserRegister(body);
    const userRole = body.userType;

    if (isAvailable) {
      if (userRole === UserTypes.BUSINESS) {
        const verificationCode = randomInt(100000, 999999).toString();
        const hashedPassword = await bcrypt.hashSync(body.password, 10);
        // Doğrulama kodunun 15 dakika sonra süresinin dolmasını ayarladık
        const confirmCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const business = await this.authRepository.save({
          ...body,
          role: userRole,
          password: hashedPassword,
          confirmCode: verificationCode,
          confirmCodeExpiresAt: confirmCodeExpiresAt,
          isEmailConfirmed: false, // Yeni kayıt olanlar başlangıçta doğrulanmamış olur
        });

        await this.mailService.sendUserConfirmation(
          body.email,
          verificationCode,
        );

        const payload: JwtPayload = {
          email: business.email,
          id: business.id,
          role: userRole,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
          expiresIn: '30d',
        });

        return {
          user: business,
          refreshToken: refreshToken,
          accessToken: accessToken,
        };
      } else if (userRole === UserTypes.ADMIN) {
        const hashedPassword = await bcrypt.hashSync(body.password, 10);
        const admin = await this.authRepository.save({
          ...body,
          role: userRole,
          password: hashedPassword,
          isEmailConfirmed: true,
        });

        const payload: JwtPayload = {
          email: admin.email,
          id: admin.id,
          role: userRole,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
          expiresIn: '30d',
        });
        return {
          user: admin,
          refreshToken: refreshToken,
          accessToken: accessToken,
        };
      } else {
        throw new NotFoundException(
          ResponseMessages.USER_TYPE_NOT_VALID_FOR_REGISTER,
        );
      }
    } else {
      throw new BadRequestException(ResponseMessages.EMAIL_ALREADY_EXISTS);
    }
  }

  async login(body: LoginRequestDto) {
    const user = await this.authRepository.findOne({
      where: { email: body.email },
    });
    if (!user) {
      throw new NotFoundException(ResponseMessages.USER_NOT_FOUND);
    }
    const isPasswordMatch = await bcrypt.compare(body.password, user.password);
    if (!isPasswordMatch) {
      throw new NotFoundException(ResponseMessages.PASSWORD_OR_EMAIL_INCORRECT);
    }

    // Email doğrulanmadıysa giriş yapmasını engelle
    if (user.role === UserTypes.BUSINESS && !user.isEmailConfirmed) {
      throw new BadRequestException(ResponseMessages.EMAIL_NOT_CONFIRMED);
    }

    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    return { user: user, refreshToken: refreshToken, accessToken: accessToken };
  }

  private async isEmailAvailableForUserRegister(body: RegisterRequestDto) {
    const isEmailAvailable = await this.authRepository.findOne({
      where: { email: body.email },
    });
    if (isEmailAvailable) {
      throw new BadRequestException(ResponseMessages.EMAIL_ALREADY_EXISTS);
    }
    return true;
  }

  async confirmEmail(
    email: string,
    confirmCode: string,
  ): Promise<{ message: string }> {
    const user = await this.authRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(ResponseMessages.USER_NOT_FOUND);
    }

    if (user.isEmailConfirmed) {
      throw new BadRequestException(ResponseMessages.EMAIL_ALREADY_CONFIRMED);
    }

    // Doğrulama kodunu kontrol et
    if (user.confirmCode !== confirmCode) {
      throw new BadRequestException(ResponseMessages.INVALID_CONFIRM_CODE);
    }

    // Kodun süresi doldu mu kontrol et
    if (user.confirmCodeExpiresAt && new Date() > user.confirmCodeExpiresAt) {
      // KOD SÜRESİ DOLMUŞSA: Yeni kod oluştur ve gönder
      const newVerificationCode = randomInt(100000, 999999).toString();
      const newConfirmCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // Yeni 15 dakikalık süre

      user.confirmCode = newVerificationCode;
      user.confirmCodeExpiresAt = newConfirmCodeExpiresAt;
      await this.authRepository.save(user); // Kullanıcıyı yeni kodla kaydet

      // Yeni kodu e-posta ile gönder
      await this.mailService.sendUserConfirmation(
        user.email,
        newVerificationCode,
      );

      throw new BadRequestException(
        ResponseMessages.CONFIRM_CODE_EXPIRED_NEW_SENT, // Yeni bir hata mesajı ekleyin
      );
    }

    user.isEmailConfirmed = true;
    user.confirmCode = null!;
    user.confirmCodeExpiresAt = null!;

    await this.authRepository.save(user);

    return { message: ResponseMessages.EMAIL_CONFIRMED_SUCCESSFULLY };
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  createAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.authRepository.findOne({ where: { id } });
  }
}
