import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { KeysService } from '../keys/keys.service';

@Injectable()
export class ApiKeyGuard {
  constructor(private keysService: KeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('No API key provided');
    }

    const validKey = await this.keysService.validateApiKey(apiKey);
    
    if (!validKey) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    req.user = validKey.user;
    req.apiKey = validKey;
    return true;
  }
}