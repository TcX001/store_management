import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  // เพิ่มการตรวจสอบว่ามีค่าหรือไม่
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT Secret keys must be defined in environment variables');
  }

  return {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
});