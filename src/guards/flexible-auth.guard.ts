import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { KeysService } from '../keys/keys.service';

@Injectable()
export class FlexibleAuthGuard {
  constructor(
    private jwtService: JwtService,
    private keysService: KeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];

    // Try JWT first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = this.jwtService.verify(token);
        req.user = { id: payload.sub, email: payload.email };
        req.authType = 'jwt';
        return true;
      } catch (err) {
        // Token invalid, continue to try API key
      }
    }

    // Try API key
    if (apiKey) {
      const validKey = await this.keysService.validateApiKey(apiKey);
      if (validKey) {
        req.user = validKey.user;
        req.apiKey = validKey;
        req.authType = 'api-key';
        return true;
      }
    }

    throw new UnauthorizedException('No valid authentication provided');
  }
}