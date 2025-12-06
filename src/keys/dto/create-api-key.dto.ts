import { IsString, IsOptional, IsDateString, IsNumber  } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsNumber()
  expiresInDays?: number; 
}