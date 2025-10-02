import { IsOptional, IsString, Length, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @Length(3, 100)
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Length(3, 200)
  organizationName?: string;

  @IsOptional()
  @IsString()
  imagemPerfil?: string;
}