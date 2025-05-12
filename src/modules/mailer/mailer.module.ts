import { Module } from '@nestjs/common';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { MailersService } from './mailer.service';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';
import { mailerConfig } from 'src/config/mailer.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule.forFeature(mailerConfig)],
      useFactory: (config: ConfigType<typeof mailerConfig>): MailerOptions => ({
        transport: {
          host: config.mailer.host,
          port: config.mailer.port,
          ignoreTLS: true,
          secure: true,
          pool: true,
          auth: {
            user: config.auth.user,
            pass: config.auth.pass,
          },
        },
        defaults: {
          from: '"Izi Dev" <izidev@gmail.com>',
        },
        template: {
          dir: join(process.cwd(), 'views/emails/'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [mailerConfig.KEY],
    }),
  ],
  providers: [MailersService],
  exports: [MailerModule, MailersService],
})
export class MailerConfigModule {}
