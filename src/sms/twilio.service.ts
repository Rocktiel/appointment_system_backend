import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
import { twilioConfig } from '../_common/config/twilio.config';

const client = new Twilio(twilioConfig.accountSid, twilioConfig.authToken);

@Injectable()
export class TwilioService {
  async sendVerificationCode(phone: string) {
    const verification = await client.verify.v2
      .services(twilioConfig.verifyServiceSid || '')
      .verifications.create({ to: phone, channel: 'sms' });

    return verification.status; // 'pending'
  }

  async verifyCode(phone: string, code: string) {
    const verificationCheck = await client.verify.v2
      .services(twilioConfig.verifyServiceSid || '')
      .verificationChecks.create({ to: phone, code });

    return verificationCheck.status; // 'approved' or 'failed'
  }
}
