// Bu, gerçek bir SMS sağlayıcısıyla (Twilio, Vonage, Turkcell/Vodafone API'leri vb.) entegrasyon yapacağımız yerdir.
// Şu an için sadece bir placeholder (yer tutucu).
export async function sendSms(
  phoneNumber: string,
  message: string,
): Promise<void> {
  // console.log(`Sending SMS to: ${phoneNumber} with message: "${message}"`);
  // Gerçek entegrasyon burada olurdu:
  // try {
  //   const response = await fetch('YOUR_SMS_PROVIDER_API_ENDPOINT', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       to: phoneNumber,
  //       body: message,
  //       // API key, secret vb.
  //     }),
  //   });
  //   if (!response.ok) {
  //     const errorData = await response.json();
  //     console.error('SMS API error:', errorData);
  //     throw new Error(`SMS gönderme hatası: ${errorData.message || response.statusText}`);
  //   }
  //   console.log('SMS gönderildi:', await response.json());
  // } catch (error) {
  //   console.error('SMS gönderme hatası:', error);
  //   throw error;
  // }
}
