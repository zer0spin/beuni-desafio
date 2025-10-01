import { IsOptional, IsString, Length, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @Length(3, 100)
  name?: string;

  @IsOptional()
  @IsString()
  imagemPerfil?: string;
}