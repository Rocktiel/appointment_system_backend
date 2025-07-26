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
import { Response } from 'express';
import { RegisterResponseDto } from './dto/response/RegisterResponse.dto';
import { BaseResponse } from 'src/_base/response/base.response';
import { ResponseMessages } from 'src/_common/enums/ResponseMessages.enum';
import { ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/response/LoginResponse.dto';
import { LoginRequestDto } from './dto/request/LoginRequest.dto';
import { ConfirmEmailDto } from './dto/request/ConfirmEmail.dot';
import { JwtAuthGuard } from 'src/_common/guard/jwt-auth.guard';
import { RefreshTokenDto } from './dto/request/RefreshToken.dto';
import { User } from 'src/_common/typeorm';
interface AuthenticatedRequest extends Request {
  user: User;
}
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(ValidationPipe)
  @ApiResponse({ status: 200, type: RegisterResponseDto })
  @ApiOperation({
    summary: 'Register API',
    description:
      'Bu API admin ve business tarafından kullanılan bir register api',
  })
  async register(
    @Body() body: RegisterRequestDto,
    @Res() res: Response<RegisterResponseDto>,
  ): Promise<void> {
    try {
      const result: { user: any; refreshToken: string; accessToken: string } =
        await this.authService.register(body);
      res.json(
        new BaseResponse(
          {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
          true,
          ResponseMessages.SUCCESS,
        ),
      );
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiOperation({
    summary: 'Login API',
    description:
      'Bu API admin ve business tarafından kullanılan bir login api.',
  })
  async login(
    @Body() body: LoginRequestDto,
    @Res() res: Response<LoginResponseDto>,
  ): Promise<void> {
    try {
      const result: { user: any; refreshToken: string; accessToken: string } =
        await this.authService.login(body);
      res.json(
        new BaseResponse(
          {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
          true,
          ResponseMessages.SUCCESS,
        ),
      );
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
  async confirmEmail(@Body(ValidationPipe) confirmEmailDto: ConfirmEmailDto) {
    const { email, confirmCode } = confirmEmailDto;
    return this.authService.confirmEmail(email, confirmCode);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refreshToken(@Body() body: RefreshTokenDto) {
    try {
      // Refresh token doğrulama işlemi
      const payload = this.authService.verifyToken(body.refreshToken);

      // Yeni access token oluştur
      const newAccessToken = this.authService.createAccessToken({
        email: payload.email,
        id: payload.id,
        role: payload.role,
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyToken(@Req() req: AuthenticatedRequest) {
    return {
      user: req.user,
      isValid: true,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }
}
