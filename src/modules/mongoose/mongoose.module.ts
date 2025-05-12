import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import databaseConfig from 'src/config/database.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: (config: ConfigType<typeof databaseConfig>) => ({
        uri: config.mongodb.uri,
        onConnectionCreate: (connect: Connection) => {
          connect.on('connected', () => console.log('>>> DB connected'));
          connect.on('open', () => console.log('>>> DB open'));
          connect.on('disconnected', () => console.log('>>> DB disconnected'));
          connect.on('reconnected', () => console.log('>>> DB reconnected'));
          connect.on('disconnecting', () =>
            console.log('>>> DB disconnecting'),
          );
          return connect;
        },
      }),
      inject: [databaseConfig.KEY],
    }),
  ],
})
export class MongooseModuleConfig {}
