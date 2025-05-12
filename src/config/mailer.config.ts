import { registerAs } from '@nestjs/config';

export const mailerConfig = registerAs('mailer', () => ({
  mailer: {
    host: process.env.MAILER_HOST || 'localhost',
    port: Number(process.env.MAILER_PORT) || 1025,
  },
  auth: {
    user: process.env.MAILDEV_INCOMING_USER,
    pass: process.env.MAILDEV_INCOMING_PASS,
  },
}));
