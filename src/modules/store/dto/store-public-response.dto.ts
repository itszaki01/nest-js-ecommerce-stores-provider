import { Exclude } from "class-transformer";

export class StorePublicResponseDto<T> {
    @Exclude()
    googleSheetApi: string;

    @Exclude()
    headCode: string;

    @Exclude()
    tikTokConvApi: [];

    @Exclude()
    facebookConvApi: [];

    @Exclude()
    createdByStopDesk?: string;

    @Exclude()
    storeOwner?: string;

    @Exclude()
    apiKey1?: string;

    @Exclude()
    apiKey2?: string;

    @Exclude()
    apiKey3?: string;

    @Exclude()
    apiKey4?: string;

    @Exclude()
    apiKey5?: string;

    @Exclude()
    totalUnpaidFees: number;

    @Exclude()
    totalUnpaidOrders: number;

    constructor(partial: Partial<T>) {
        Object.assign(this, partial);
    }
}
