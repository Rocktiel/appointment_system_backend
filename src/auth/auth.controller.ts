import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dto/request/RegisterRequest.dto';
import { Response } from 'express'; // Response'u burdan almalısın
import {
  RegisterResponse,
  RegisterResponseDto,
} from './dto/response/RegisterResponse.dto';
import { BaseResponse } from 'src/_base/response/base.response';
import { ResponseMessages } from 'src/_common/enums/ResponseMessages.enum';
import { ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  LoginResponse,
  LoginResponseDto,
} from './dto/response/LoginResponse.dto';
import { LoginRequestDto } from './dto/request/LoginRequest.dto';
import { ConfirmEmailDto } from './dto/request/ConfirmEmail.dot';
import { JwtAuthGuard } from 'src/_common/guard/jwt-auth.guard';
import { User } from 'src/_common/typeorm';

// Request objesine kullanıcı ve çerez bilgilerini eklemek için interface
interface AuthenticatedRequest extends Request {
  user: User;
  cookies: {
    refresh_token?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(ValidationPipe)
  @ApiResponse({ status: 200, type: RegisterResponseDto })
  @ApiOperation({
    summary: 'Kullanıcı Kayıt API',
    description:
      'Bu API, admin ve işletme kullanıcılarının kayıt olması için kullanılır.',
  })
  async register(
    @Body() body: RegisterRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseDto> {
    try {
      const { user, refreshToken, accessToken } =
        await this.authService.register(body);

      // Refresh token'ı HttpOnly çerez olarak ayarla
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: false, // Üretimde HTTPS için true olmalı
        sameSite: 'lax', // CSRF koruması için 'lax' veya 'strict' önerilir
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün geçerlilik süresi
        path: '/', // Tüm domain için geçerli
      });

      const responseData: RegisterResponse = {
        user: user as any, // User tipiniz ile RegisterResponse'daki user tipi uyumlu olduğundan emin olun
        accessToken: accessToken,
      };

      return new BaseResponse<RegisterResponse>(
        responseData,
        true,
        ResponseMessages.SUCCESS,
      ) as RegisterResponseDto;
    } catch (error) {
      // AuthService'ten fırlatılan özel istisnaları yakala ve tekrar fırlat
      throw error;
    }
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiOperation({
    summary: 'Kullanıcı Giriş API',
    description:
      'Bu API, admin ve işletme kullanıcılarının giriş yapması için kullanılır.',
  })
  async login(
    @Body() body: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    try {
      const { user, refreshToken, accessToken } =
        await this.authService.login(body);

      // Refresh token'ı HttpOnly çerez olarak ayarla
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: false, // Üretimde HTTPS için true olmalı
        sameSite: 'lax',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün geçerlilik süresi
        path: '/',
      });

      const responseData: LoginResponse = {
        user: user as any, // User tipiniz ile LoginResponse'daki user tipi uyumlu olduğundan emin olun
        accessToken: accessToken,
      };

      return new BaseResponse<LoginResponse>(
        responseData,
        true,
        ResponseMessages.SUCCESS,
      ) as LoginResponseDto;
    } catch (error) {
      throw error;
    }
  }

  @Post('confirm-email')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Email başarıyla doğrulandı.' })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz doğrulama kodu veya email zaten doğrulanmış.',
  })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı.' })
  @ApiBody({ type: ConfirmEmailDto })
  @ApiOperation({
    summary: 'E-posta Doğrulama API',
    description: 'Kullanıcının e-posta adresini doğrulamasını sağlar.',
  })
  async confirmEmail(@Body(ValidationPipe) confirmEmailDto: ConfirmEmailDto) {
    const { email, confirmCode } = confirmEmailDto;
    return this.authService.confirmEmail(email, confirmCode);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Access token yenileme' })
  @ApiResponse({ status: 200, description: 'Token başarıyla yenilendi.' })
  @ApiResponse({ status: 401, description: 'Yetkilendirme başarısız.' })
  async refreshToken(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenFromCookie = req.cookies?.refresh_token;

    if (!refreshTokenFromCookie) {
      throw new UnauthorizedException('Refresh token çerezlerde bulunamadı.');
    }

    try {
      // Refresh token'ı doğrula ve payload'ı al
      const payload = this.authService.verifyToken(refreshTokenFromCookie);

      // Yeni access token ve yeni refresh token oluştur (token rotasyonu)
      const { newAccessToken, newRefreshToken } =
        await this.authService.refreshTokens(payload);

      // Yeni refresh token'ı HttpOnly çerez olarak ayarla
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: false, // Üretimde HTTPS için true olmalı
        sameSite: 'lax',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        // expires: new Date(Date.now() + 7 * 60 * 1000), // 7m geçerlilik süresi
        path: '/',
      });

      return new BaseResponse(
        { accessToken: newAccessToken },
        true,
        ResponseMessages.SUCCESS,
      );
    } catch (error) {
      // Refresh token geçersizse veya başka bir hata olursa
      console.error('Refresh token hatası:', error);
      throw new UnauthorizedException('Geçersiz refresh token.');
    }
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard) // Access token'ı doğrular ve req.user'ı doldurur
  @ApiOperation({ summary: 'Access token doğrulama' })
  @ApiResponse({
    status: 200,
    description: 'Token geçerli ve kullanıcı bilgileri döndürüldü.',
  })
  @ApiResponse({ status: 401, description: 'Yetkilendirme başarısız.' })
  async verifyToken(@Req() req: AuthenticatedRequest) {
    // JwtAuthGuard zaten access token'ı doğrulamış ve req.user'ı doldurmuş durumda.
    // Bu endpoint'in amacı sadece token'ın geçerli olduğunu ve kullanıcının kimliğini doğrulamaktır.
    // Yeni bir access token oluşturmaya gerek yoktur, çünkü bu token yenileme işlemi değildir.
    // Eğer client'ın yeni bir access token'a ihtiyacı varsa, '/auth/refresh' endpoint'ini kullanmalıdır.
    const user = req.user;
    return new BaseResponse(
      { user, isValid: true }, // Sadece kullanıcı bilgileri ve geçerlilik durumu döndürülür
      true,
      ResponseMessages.SUCCESS,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mevcut kullanıcı bilgilerini getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı bilgileri döndürüldü.' })
  @ApiResponse({ status: 401, description: 'Yetkilendirme başarısız.' })
  async getCurrentUser(@Req() req: AuthenticatedRequest) {
    return new BaseResponse(req.user, true, ResponseMessages.SUCCESS);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard) // Kullanıcının oturumunun açık olduğunu doğrulamak için (isteğe bağlı)
  @ApiOperation({ summary: 'Kullanıcı çıkışı' })
  @ApiResponse({ status: 200, description: 'Başarıyla çıkış yapıldı.' })
  async logout(@Res({ passthrough: true }) res: Response) {
    // Refresh token çerezini temizle
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return { message: ResponseMessages.LOGOUT_SUCCESS };
  }
}
