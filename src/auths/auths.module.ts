import { Module } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from 'src/modules/collections/orders/orders.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    OrdersModule,
  ],
  controllers: [AuthsController],
  providers: [AuthsService],
  exports: [AuthsService, MongooseModule],
})
export class AuthsModule {}
