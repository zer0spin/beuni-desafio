import { IsString, Length } from 'class-validator';

export class UpdateOrganizacaoDto {
  @IsString()
  @Length(3, 100)
  name: string;
}