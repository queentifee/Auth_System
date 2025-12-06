import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { KeysService } from './keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('keys')
@UseGuards(JwtAuthGuard)
export class KeysController {
  constructor(private keysService: KeysService) {}

  @Post('create')
  async create(@Body() dto: CreateApiKeyDto, @Req() req) {
    return this.keysService.createApiKey(req.user.id, dto);
  }

  @Get()
  async list(@Req() req) {
    return this.keysService.listApiKeys(req.user.id);
  }

  @Delete(':id/revoke')
  async revoke(@Param('id') id: string, @Req() req) {
    return this.keysService.revokeApiKey(id, req.user.id);
  }
}
