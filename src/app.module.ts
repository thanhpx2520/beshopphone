import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { MongooseModuleConfig } from './modules/mongoose/mongoose.module';
import { CategoriesModule } from './modules/collections/categories/categories.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SlidersModule } from './modules/collections/sliders/sliders.module';
import { BannersModule } from './modules/collections/banners/banners.module';
import { ProductsModule } from './modules/collections/products/products.module';
import { CommentsModule } from './modules/collections/comments/comments.module';
import { AuthsModule } from './auths/auths.module';
import { OrdersModule } from './modules/collections/orders/orders.module';
import { MailerConfigModule } from './modules/mailer/mailer.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    CategoriesModule,
    SlidersModule,
    BannersModule,
    ProductsModule,
    CommentsModule,
    AuthsModule,
    OrdersModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [appConfig, databaseConfig],
      isGlobal: true,
    }),
    MongooseModuleConfig,
    MailerConfigModule,
    AuthModule, // Đảm bảo AuthModule được import
    PassportModule.register({ defaultStrategy: 'local' }), // Đăng ký passport-local ở đây
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
