import { IsString, IsBoolean, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateTodoDto {

  @IsInt()  
  @IsNotEmpty() 
  userId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class UpdateTodoDto {
  @IsInt() 
  @IsOptional()  
  userId?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
