import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateStoreCategoryDto {
    @IsNotEmpty()
    @MaxLength(30)
    @IsString()
    name: string;

    // @IsUrl()
    @IsNotEmpty()
    @IsString()
    iconUrl: string;

    id?: string;
}
