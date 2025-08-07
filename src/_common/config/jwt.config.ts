import { registerAs } from '@nestjs/config';

export default registerAs('jwt_service', () => ({
  // Debugging purpose, can be removed later
  // JWT Secret Key: Token'ları imzalamak ve doğrulamak için kullanılır.
  // Ortam değişkeninden alınmalı, yoksa varsayılan bir değer kullanılabilir (ancak üretimde bu asla olmamalıdır).
  secret: process.env.JWT_SECRET || 'super_secret_key_change_me_in_production',

  // Access Token Ayarları
  // Access token'ın geçerlilik süresi. Genellikle kısa tutulur (örn: '5m', '15m').
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',

  // Refresh Token Ayarları
  // Refresh token'ın geçerlilik süresi. Access token'dan daha uzun tutulur (örn: '7d', '30d').
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

  // JWT algoritması (isteğe bağlı, varsayılan 'HS256' ise belirtmeye gerek yok)
  // algorithm: process.env.JWT_ALGORITHM || 'HS256',
}));
