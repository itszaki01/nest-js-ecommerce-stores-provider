import { IsArray, IsBoolean, IsOptional } from "class-validator";

export class CreateStoreApplicationDto {
    store: string;

    @IsOptional()
    @IsBoolean()
    allowFacebookConvApis: boolean;
    
    @IsOptional()
    @IsArray()
    facebookConvApis: { pixelId: string; access_token: string; allowTestMode: boolean; testCode: string }[];
    
    @IsOptional()
    @IsBoolean()
    allowGoogleSheetsApis: boolean;
    
    @IsOptional()
    @IsArray()
    googleSheetsApis: { apiKey: string }[];
    
    @IsOptional()
    @IsBoolean()
    allowTikTokConvApis: boolean;
    
    
    @IsOptional()
    @IsArray()
    tikTokConvApis: { pixelId: string; access_token: string; allowTestMode: boolean; testCode: string }[];
}
