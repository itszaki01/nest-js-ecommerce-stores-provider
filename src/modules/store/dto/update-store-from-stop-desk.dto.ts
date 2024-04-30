import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateStoreFromStopDeskDto {
    @IsBoolean()
    @IsOptional()
    allowConfirmationService?: boolean;

    @IsOptional()
    @IsEnum(["basic", "pro"])
    storeSubcreption?: "basic" | "pro";

    @IsOptional()
    @IsString()
    apiKey1?: string;

    @IsOptional()
    @IsString()
    apiKey2?: string;

    @IsOptional()
    @IsString()
    apiKey3?: string;

    @IsOptional()
    @IsString()
    apiKey4?: string;

    @IsOptional()
    @IsString()
    apiKey5?: string;
}
