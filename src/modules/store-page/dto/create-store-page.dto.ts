import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateStorePageDto {

    
    @IsString()
    @IsNotEmpty()
    @MaxLength(300)
    title: string;
    
    @IsBoolean()
    @IsOptional()
    showPage: boolean;
    
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    slug: string;
    

    @IsString()
    @IsNotEmpty()
    body: string;
}
