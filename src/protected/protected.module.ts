import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtectedController } from './protected.controller';
import { ApiKey } from 'src/entities/api-key.entity';
import { KeysModule } from 'src/keys/keys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    }),
    KeysModule,
  ],
  controllers: [ProtectedController],
})
export class ProtectedModule {}