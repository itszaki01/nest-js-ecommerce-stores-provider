import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateStoreDomainDto {
    @MaxLength(60)
    @IsString()
    @IsNotEmpty()
    domainName: string;
}
