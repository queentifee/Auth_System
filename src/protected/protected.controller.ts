import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { FlexibleAuthGuard } from 'src/guards/flexible-auth.guard';

@Controller('protected')
export class ProtectedController {
  
  // Only accessible with JWT token
  @Get('user-only')
  @UseGuards(JwtAuthGuard)
  userOnly(@Req() req) {
    return {
      message: 'This route is for authenticated users only (JWT)',
      user: req.user,
    };
  }

  // Only accessible with API key
  @Get('service-only')
  @UseGuards(ApiKeyGuard)
  serviceOnly(@Req() req) {
    return {
      message: 'This route is for service-to-service calls only (API Key)',
      user: req.user,
      apiKey: {
        id: req.apiKey.id,
        name: req.apiKey.name,
      },
    };
  }

  // Accessible with either JWT or API key
  @Get('flexible')
  @UseGuards(FlexibleAuthGuard)
  flexible(@Req() req) {
    return {
      message: 'This route accepts both JWT and API Key authentication',
      authType: req.authType,
      user: req.user,
      ...(req.apiKey && {
        apiKey: {
          id: req.apiKey.id,
          name: req.apiKey.name,
        },
      }),
    };
  }

  @Get('public')
  public() {
    return {
      message: 'This is a public route, no authentication required',
    };
  }
}