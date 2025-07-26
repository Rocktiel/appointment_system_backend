import { Controller, Post, Body } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Controller('sms')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('send-code')
  async sendCode(@Body('phone') phone: string) {
    const status = await this.twilioService.sendVerificationCode(phone);
    return { status };
  }

  @Post('verify-code')
  async verifyCode(@Body() body: { phone: string; code: string }) {
    const result = await this.twilioService.verifyCode(body.phone, body.code);
    return { result };
  }
}
