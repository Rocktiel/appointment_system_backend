// import {
//   Body,
//   Controller,
//   Get,
//   HttpCode,
//   HttpStatus,
//   Inject,
//   Post,
//   Req,
//   Res,
//   UnauthorizedException,
//   UseGuards,
//   UsePipes,
//   ValidationPipe,
// } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { RegisterRequestDto } from './dto/request/RegisterRequest.dto';
// import { Response } from 'express';
// import { RegisterResponseDto } from './dto/response/RegisterResponse.dto';
// import { BaseResponse } from 'src/_base/response/base.response';
// import { ResponseMessages } from 'src/_common/enums/ResponseMessages.enum';
// import { ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
// import { LoginResponseDto } from './dto/response/LoginResponse.dto';
// import { LoginRequestDto } from './dto/request/LoginRequest.dto';
// import { ConfirmEmailDto } from './dto/request/ConfirmEmail.dot';
// import { JwtAuthGuard } from 'src/_common/guard/jwt-auth.guard';
// import { RefreshTokenDto } from './dto/request/RefreshToken.dto';
// import { User } from 'src/_common/typeorm';
// interface AuthenticatedRequest extends Request {
//   user: User;
// }
// @Controller('auth')
// export class AuthController {
//   constructor(@Inject(AuthService) private readonly authService: AuthService) {}

//   @Post('register')
//   @UsePipes(ValidationPipe)
//   @ApiResponse({ status: 200, type: RegisterResponseDto })
//   @ApiOperation({
//     summary: 'Register API',
//     description:
//       'Bu API admin ve business tarafından kullanılan bir register api',
//   })
//   async register(
//     @Body() body: RegisterRequestDto,
//     @Res() res: Response<RegisterResponseDto>,
//   ): Promise<void> {
//     try {
//       const result: { user: any; refreshToken: string; accessToken: string } =
//         await this.authService.register(body);
//       res.json(
//         new BaseResponse(
//           {
//             user: result.user,
//             accessToken: result.accessToken,
//             refreshToken: result.refreshToken,
//           },
//           true,
//           ResponseMessages.SUCCESS,
//         ),
//       );
//     } catch (error) {
//       throw error;
//     }
//   }

//   @Post('login')
//   @UsePipes(ValidationPipe)
//   @ApiResponse({ status: 200, type: LoginResponseDto })
//   @ApiOperation({
//     summary: 'Login API',
//     description:
//       'Bu API admin ve business tarafından kullanılan bir login api.',
//   })
//   async login(
//     @Body() body: LoginRequestDto,
//     @Res() res: Response<LoginResponseDto>,
//   ): Promise<void> {
//     try {
//       const result: { user: any; refreshToken: string; accessToken: string } =
//         await this.authService.login(body);
//       res.json(
//         new BaseResponse(
//           {
//             user: result.user,
//             accessToken: result.accessToken,
//             refreshToken: result.refreshToken,
//           },
//           true,
//           ResponseMessages.SUCCESS,
//         ),
//       );
//     } catch (error) {
//       throw error;
//     }
//   }

//   @Post('confirm-email')
//   @HttpCode(HttpStatus.OK)
//   @ApiResponse({ status: 200, description: 'Email başarıyla doğrulandı.' })
//   @ApiResponse({
//     status: 400,
//     description: 'Geçersiz doğrulama kodu veya email zaten doğrulanmış.',
//   })
//   @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı.' })
//   @ApiBody({ type: ConfirmEmailDto })
//   async confirmEmail(@Body(ValidationPipe) confirmEmailDto: ConfirmEmailDto) {
//     const { email, confirmCode } = confirmEmailDto;
//     return this.authService.confirmEmail(email, confirmCode);
//   }

//   @Post('refresh')
//   @ApiOperation({ summary: 'Refresh access token' })
//   @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   async refreshToken(@Body() body: RefreshTokenDto) {
//     try {
//       // Refresh token doğrulama işlemi
//       const payload = this.authService.verifyToken(body.refreshToken);

//       // Yeni access token oluştur
//       const newAccessToken = this.authService.createAccessToken({
//         email: payload.email,
//         id: payload.id,
//         role: payload.role,
//       });

//       return {
//         accessToken: newAccessToken,
//       };
//     } catch (error) {
//       throw new UnauthorizedException('Invalid refresh token');
//     }
//   }

//   @Get('verify')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Verify token' })
//   @ApiResponse({ status: 200, description: 'Token is valid' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   async verifyToken(@Req() req: AuthenticatedRequest) {
//     return {
//       user: req.user,
//       isValid: true,
//     };
//   }

//   @Get('me')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Get current user info' })
//   @ApiResponse({ status: 200, description: 'User information' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   async getCurrentUser(@Req() req: AuthenticatedRequest) {
//     return req.user;
//   }
//   @Post('logout')
//   @UseGuards(JwtAuthGuard)
//   async logout(@Res({ passthrough: true }) res: Response) {
//     res.clearCookie('access_token', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/',
//     });

//     res.clearCookie('refresh_token', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/',
//     });

//     return { message: 'Logged out successfully' };
//   }
// }
// auth.controller.ts (GÜNCELLENDİ)
// import {
//   Body,
//   Controller,
//   Get,
//   HttpCode,
//   HttpStatus,
//   Inject,
//   Post,
//   Req,
//   Res,
//   UnauthorizedException,
//   UseGuards,
//   UsePipes,
//   ValidationPipe,
// } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { RegisterRequestDto } from './dto/request/RegisterRequest.dto';
// import { Response } from 'express'; // Response'u burdan almalısın
// import {
//   RegisterResponse,
//   RegisterResponseDto,
// } from './dto/response/RegisterResponse.dto';
// import { BaseResponse } from 'src/_base/response/base.response';
// import { ResponseMessages } from 'src/_common/enums/ResponseMessages.enum';
// import { ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
// import {
//   LoginResponse,
//   LoginResponseDto,
// } from './dto/response/LoginResponse.dto';
// import { LoginRequestDto } from './dto/request/LoginRequest.dto';
// import { ConfirmEmailDto } from './dto/request/ConfirmEmail.dot';
// import { JwtAuthGuard } from 'src/_common/guard/jwt-auth.guard';
// import { User } from 'src/_common/typeorm';
// // import { RefreshTokenDto } from './dto/request/RefreshToken.dto'; // Artık body'den almayacağız

// interface AuthenticatedRequest extends Request {
//   user: User;
//   cookies: {
//     refresh_token?: string; // Refresh token çerezini okumak için
//   };
// }

// @Controller('auth')
// export class AuthController {
//   constructor(@Inject(AuthService) private readonly authService: AuthService) {}

//   @Post('register')
//   @UsePipes(ValidationPipe)
//   @ApiResponse({ status: 200, type: RegisterResponseDto })
//   @ApiOperation({
//     summary: 'Register API',
//     description:
//       'Bu API admin ve business tarafından kullanılan bir register api',
//   })
//   async register(
//     @Body() body: RegisterRequestDto,
//     @Res({ passthrough: true }) res: Response,
//   ): Promise<RegisterResponseDto> {
//     // Dönüş tipi doğrudan RegisterResponseDto
//     try {
//       const { user, refreshToken, accessToken } =
//         await this.authService.register(body);

//       res.cookie('refresh_token', refreshToken, {
//         httpOnly: true,
//         secure: false, // Geliştirme ortamında false, prod'da true olmalı
//         // secure: process.env.NODE_ENV === 'production', // Prod ortamında true olmalı
//         sameSite: 'lax',
//         expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//         path: '/',
//       });

//       const responseData: RegisterResponse = {
//         // Sadece RegisterResponse tipinde veriyi oluşturuyoruz
//         user: user as any, // User tipiniz ile UserResponse tipiniz aynı değilse burayı kontrol edin
//         accessToken: accessToken,
//       };

//       // BaseResponse constructor'ını çağırıp, sonucu doğrudan RegisterResponseDto olarak döndürüyoruz
//       return new BaseResponse<RegisterResponse>( // BaseResponse'a jenerik tipi veriyoruz
//         responseData,
//         true,
//         ResponseMessages.SUCCESS,
//       ) as RegisterResponseDto; // Son olarak RegisterResponseDto'ya cast ediyoruz
//     } catch (error) {
//       throw error;
//     }
//   }

//   @Post('login')
//   @UsePipes(ValidationPipe)
//   @ApiResponse({ status: 200, type: LoginResponseDto })
//   @ApiOperation({
//     summary: 'Login API',
//     description:
//       'Bu API admin ve business tarafından kullanılan bir login api.',
//   })
//   async login(
//     @Body() body: LoginRequestDto,
//     @Res({ passthrough: true }) res: Response,
//   ): Promise<LoginResponseDto> {
//     console.log('Login request body:', body);
//     // Dönüş tipi doğrudan LoginResponseDto
//     try {
//       const { user, refreshToken, accessToken } =
//         await this.authService.login(body);

//       res.cookie('refresh_token', refreshToken, {
//         httpOnly: true,
//         secure: false,
//         sameSite: 'lax',
//         expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//         path: '/',
//       });

//       const responseData: LoginResponse = {
//         // Sadece LoginResponse tipinde veriyi oluşturuyoruz
//         user: user as any, // User tipiniz ile UserResponse tipiniz aynı değilse burayı kontrol edin
//         accessToken: accessToken,
//       };
//       console.log('Login response data:', responseData);
//       // BaseResponse constructor'ını çağırıp, sonucu doğrudan LoginResponseDto olarak döndürüyoruz
//       return new BaseResponse<LoginResponse>( // BaseResponse'a jenerik tipi veriyoruz
//         responseData,
//         true,
//         ResponseMessages.SUCCESS,
//       ) as LoginResponseDto; // Son olarak LoginResponseDto'ya cast ediyoruz
//     } catch (error) {
//       throw error;
//     }
//   }

//   @Post('confirm-email')
//   @HttpCode(HttpStatus.OK)
//   @ApiResponse({ status: 200, description: 'Email başarıyla doğrulandı.' })
//   @ApiResponse({
//     status: 400,
//     description: 'Geçersiz doğrulama kodu veya email zaten doğrulanmış.',
//   })
//   @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı.' })
//   @ApiBody({ type: ConfirmEmailDto })
//   async confirmEmail(@Body(ValidationPipe) confirmEmailDto: ConfirmEmailDto) {
//     const { email, confirmCode } = confirmEmailDto;
//     return this.authService.confirmEmail(email, confirmCode);
//   }

//   @Post('refresh')
//   @ApiOperation({ summary: 'Refresh access token' })
//   @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   async refreshToken(
//     @Req() req: AuthenticatedRequest,
//     @Res({ passthrough: true }) res: Response,
//   ) {
//     const refreshTokenFromCookie = req.cookies?.refresh_token;
//     console.log('Refresh token from cookie:', refreshTokenFromCookie);
//     if (!refreshTokenFromCookie) {
//       throw new UnauthorizedException('Refresh token not found in cookies');
//     }

//     try {
//       // Refresh token doğrulama işlemi
//       const payload = this.authService.verifyToken(refreshTokenFromCookie);

//       // Yeni access token ve (opsiyonel olarak) yeni refresh token oluştur
//       const { newAccessToken, newRefreshToken } =
//         await this.authService.refreshTokens(payload);

//       // Yeni refresh token'ı HttpOnly çerez olarak ayarla (refresh token rotation)
//       res.cookie('refresh_token', newRefreshToken, {
//         httpOnly: true,
//         secure: false,
//         sameSite: 'lax',
//         expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
//         path: '/',
//       });

//       return new BaseResponse(
//         { accessToken: newAccessToken },
//         true,
//         ResponseMessages.SUCCESS,
//       );
//     } catch (error) {
//       throw new UnauthorizedException('Invalid refresh token');
//     }
//   }

//   @Get('verify')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Verify token' })
//   @ApiResponse({ status: 200, description: 'Token is valid' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   async verifyToken(@Req() req: AuthenticatedRequest) {
//     // req.user zaten JwtAuthGuard tarafından doldurulur
//     const user = req.user;
//     // İsteğe bağlı: backend'den dönen yanıtta yeni bir access token da döndürülebilir,
//     // böylece frontend'de `checkAuth` sonrası `accessToken`'ı güncelleyebilirsiniz.
//     const newAccessToken = this.authService.createAccessToken({
//       email: user.email,
//       id: user.id,
//       role: user.role,
//     });
//     return new BaseResponse(
//       { user, accessToken: newAccessToken, isValid: true },
//       true,
//       ResponseMessages.SUCCESS,
//     );
//   }

//   @Get('me')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Get current user info' })
//   @ApiResponse({ status: 200, description: 'User information' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   async getCurrentUser(@Req() req: AuthenticatedRequest) {
//     return new BaseResponse(req.user, true, ResponseMessages.SUCCESS);
//   }

//   @Post('logout')
//   @UseGuards(JwtAuthGuard)
//   async logout(@Res({ passthrough: true }) res: Response) {
//     // Yalnızca refresh token çerezini temizlemek yeterlidir.
//     // Frontend zaten accessToken'ı belleğinden temizleyecek.
//     res.clearCookie('refresh_token', {
//       httpOnly: true,
//       secure: false, // Geliştirme ortamında false, prod'da true olmalı,
//       sameSite: 'lax', // 'Lax' veya 'Strict' olmalı
//       path: '/', // Çerezin ayarlandığı path ile aynı olmalı
//     });

//     // access_token çerezini tutmuyorsanız, bunu temizlemenize gerek kalmaz
//     // res.clearCookie('access_token', {
//     //   httpOnly: true,
//     //   secure: process.env.NODE_ENV === 'production',
//     //   sameSite: 'strict',
//     //   path: '/',
//     // });

//     return { message: 'Logged out successfully' };
//   }
// }
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
        expires: new Date(Date.now() + 7 * 60 * 1000), // 30 gün geçerlilik süresi
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
        expires: new Date(Date.now() + 7 * 60 * 1000), // 30 gün geçerlilik süresi
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
    console.log('Request Headers:', req.headers); // Tüm gelen başlıkları kontrol et
    console.log('Request Cookies object:', req.cookies);
    const refreshTokenFromCookie = req.cookies?.refresh_token;

    if (!refreshTokenFromCookie) {
      throw new UnauthorizedException('Refresh token çerezlerde bulunamadı.');
    }
    console.log('Refresh token from cookie:', refreshTokenFromCookie);
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
        // expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        expires: new Date(Date.now() + 7 * 60 * 1000), // 30 gün geçerlilik süresi
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
