import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { KeysModule } from './keys/keys.module';
import { User } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';
import { ProtectedModule } from './protected/protected.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port:  5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'auth_system',
      entities: [User, ApiKey],
      synchronize: true, // Set to false in production
    }),
    AuthModule,
    KeysModule,
    ProtectedModule,
  ],
})
export class AppModule {}

