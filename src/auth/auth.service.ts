import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterRequestDto } from './dto/request/RegisterRequest.dto';
import { UserTypes } from 'src/_common/enums/UserTypes.enums';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/_common/typeorm';
import { Repository } from 'typeorm';
import { ResponseMessages } from 'src/_common/enums/ResponseMessages.enum';
import * as bcrypt from 'bcrypt'; // bcrypt.hash için async metodu kullanacağız
import { JwtPayload } from 'src/_common/payloads/jwt.payload';
import { JwtService } from '@nestjs/jwt';
import { LoginRequestDto } from './dto/request/LoginRequest.dto';
import { randomInt } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly authRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private generateAuthTokens(payload: JwtPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    const cleanPayload: JwtPayload = {
      email: payload.email,
      id: payload.id,
      role: payload.role,
    };

    const accessTokenExpiresIn = this.configService.get<string>(
      'jwt_service.accessTokenExpiresIn',
    );
    const refreshTokenExpiresIn = this.configService.get<string>(
      'jwt_service.refreshTokenExpiresIn',
    );

    const accessToken = this.jwtService.sign(cleanPayload, {
      expiresIn: accessTokenExpiresIn,
    });

    const refreshToken = this.jwtService.sign(cleanPayload, {
      expiresIn: refreshTokenExpiresIn,
    });

    return { accessToken, refreshToken };
  }
  /**
   * Kullanıcının e-posta adresinin kayıt için uygun olup olmadığını kontrol eder.
   * Eğer e-posta zaten kullanılıyorsa BadRequestException fırlatır.
   * @param email Kontrol edilecek e-posta adresi.
   */
  private async validateEmailForRegistration(email: string): Promise<void> {
    const existingUser = await this.authRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException(ResponseMessages.EMAIL_ALREADY_EXISTS);
    }
  }

  async register(
    body: RegisterRequestDto,
  ): Promise<{ user: User; refreshToken: string; accessToken: string }> {
    // E-posta uygunluğunu kontrol et
    await this.validateEmailForRegistration(body.email);

    // Şifreyi hash'le (async bcrypt.hash kullanıldı)
    const hashedPassword = await bcrypt.hash(body.password, 10);
    let userToSave: Partial<User>;

    // Kullanıcı tipine göre kullanıcı objesini hazırla
    if (body.userType === UserTypes.BUSINESS) {
      const verificationCode = randomInt(100000, 999999).toString();
      const confirmCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika
      userToSave = {
        ...body,
        role: body.userType,
        password: hashedPassword,
        confirmCode: verificationCode,
        confirmCodeExpiresAt: confirmCodeExpiresAt,
        isEmailConfirmed: false,
      };
    } else if (body.userType === UserTypes.ADMIN) {
      userToSave = {
        ...body,
        role: body.userType,
        password: hashedPassword,
        isEmailConfirmed: true, // Adminler için e-posta onayı varsayılan olarak true
      };
    } else {
      // Geçersiz kullanıcı tipi
      throw new BadRequestException(
        ResponseMessages.USER_TYPE_NOT_VALID_FOR_REGISTER,
      );
    }

    const user = await this.authRepository.save(userToSave);

    // İşletme kullanıcısıysa e-posta onayı gönder
    if (user.role === UserTypes.BUSINESS) {
      await this.mailService.sendUserConfirmation(
        user.email,
        user.confirmCode as string,
      );
    }
    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
      role: user.role,
    };
    // Token'ları generateAuthTokens fonksiyonu ile oluştur
    const { accessToken, refreshToken } = this.generateAuthTokens(payload);

    return { user, refreshToken, accessToken };
  }

  async login(
    body: LoginRequestDto,
  ): Promise<{ user: User; refreshToken: string; accessToken: string }> {
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

    if (user.role === UserTypes.BUSINESS && !user.isEmailConfirmed) {
      throw new BadRequestException(ResponseMessages.EMAIL_NOT_CONFIRMED);
    }

    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
      role: user.role,
    };

    const { accessToken, refreshToken } = this.generateAuthTokens(payload);

    return { user: user, refreshToken: refreshToken, accessToken: accessToken };
  }

  /**
   * Refresh token kullanarak yeni access ve refresh token'ları oluşturur.
   * Token rotasyonu için kullanılır.
   * @param payload Refresh token'dan doğrulanmış JWT payload'ı.
   * @returns Yeni access ve refresh token'ları içeren obje.
   */
  async refreshTokens(
    payload: JwtPayload,
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    // Güvenlik için: Refresh token'dan gelen payload'daki ID ile kullanıcıyı veritabanından tekrar çekmek
    // ve kullanıcının hala aktif/geçerli olduğundan emin olmak daha güvenlidir.
    // const user = await this.authRepository.findOne({ where: { id: payload.id } });
    // if (!user) throw new UnauthorizedException('User not found or invalid for refresh');

    // Token'ları generateAuthTokens fonksiyonu ile oluştur
    const { accessToken, refreshToken } = this.generateAuthTokens(payload);

    return { newAccessToken: accessToken, newRefreshToken: refreshToken };
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

    if (user.confirmCode !== confirmCode) {
      throw new BadRequestException(ResponseMessages.INVALID_CONFIRM_CODE);
    }

    if (user.confirmCodeExpiresAt && new Date() > user.confirmCodeExpiresAt) {
      const newVerificationCode = randomInt(100000, 999999).toString();
      const newConfirmCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

      user.confirmCode = newVerificationCode;
      user.confirmCodeExpiresAt = newConfirmCodeExpiresAt;
      await this.authRepository.save(user);

      await this.mailService.sendUserConfirmation(
        user.email,
        newVerificationCode,
      );

      throw new BadRequestException(
        ResponseMessages.CONFIRM_CODE_EXPIRED_NEW_SENT,
      );
    }

    user.isEmailConfirmed = true;
    user.confirmCode = null!;
    user.confirmCodeExpiresAt = null!;

    await this.authRepository.save(user);

    return { message: ResponseMessages.EMAIL_CONFIRMED_SUCCESSFULLY };
  }

  /**
   * Verilen token'ı doğrular ve payload'ını döndürür.
   * Doğrulama başarısız olursa UnauthorizedException fırlatır.
   * @param token Doğrulanacak JWT.
   * @returns JWT payload'ı.
   */
  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }
  }

  /**
   * Kullanıcı ID'sine göre kullanıcıyı veritabanından getirir.
   * @param id Kullanıcı ID'si.
   * @returns Kullanıcı objesi veya null.
   */
  async getUserById(id: number): Promise<User | null> {
    return this.authRepository.findOne({ where: { id } });
  }

  // createAccessToken fonksiyonu, generateAuthTokens fonksiyonu ile çakıştığı için kaldırıldı.
  // private createAccessToken(payload: JwtPayload): string {
  //   return this.jwtService.sign(payload, { expiresIn: '2m' });
  // }
}
