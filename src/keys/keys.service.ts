import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { ApiKey } from 'src/entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class KeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,
  ) {}

  async createApiKey(userId: string, dto: CreateApiKeyDto) {
    const rawKey = this.generateApiKey();
    const haskedKey = await bcrypt.hash(rawKey, 10);
     let expirationDate: Date | undefined;
    
    if (dto.expiresAt) {
      expirationDate = new Date(dto.expiresAt);
    } else if (dto.expiresInDays) {
      expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + dto.expiresInDays);
    }
    
    const apiKey = this.apiKeyRepo.create({
      key: haskedKey,
      name: dto.name,
      userId,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    await this.apiKeyRepo.save(apiKey);

    return {
      message: 'API key created successfully',
      apiKey: {
        id: apiKey.id,
        key: rawKey,
        name: apiKey.name,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
    };
  }

  async listApiKeys(userId: string) {
    const keys = await this.apiKeyRepo.find({
      where: { userId },
      select: ['id', 'name', 'expiresAt', 'revoked', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    return { apiKeys: keys };
  }

  async revokeApiKey(keyId: string, userId: string) {
    const apiKey = await this.apiKeyRepo.findOne({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    apiKey.revoked = true;
    await this.apiKeyRepo.save(apiKey);

    return { message: 'API key revoked successfully' };
  }

 async validateApiKey(rawKey: string): Promise<ApiKey | null> {
  const allKeys = await this.apiKeyRepo.find({
    relations: ['user'],
  });

  for (const apiKey of allKeys) {
    const isMatch = await bcrypt.compare(rawKey, apiKey.key);
    
    if (isMatch) {
      if (apiKey.revoked) {
        return null; 
      }

      if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
        return null;
      }
      
      return apiKey; 
    }
  }

  return null;
}

  private generateApiKey(): string {
    return 'sk_' + crypto.randomBytes(32).toString('hex');
  }
}