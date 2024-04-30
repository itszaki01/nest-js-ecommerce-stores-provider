import { Injectable } from "@nestjs/common";
import { CreateStoreLocationDto } from "./dto/create-store-location.dto";
import { UpdateStoreLocationDto } from "./dto/update-store-location.dto";
import { HandlersFactory } from "src/utils/handlersFactory";
import { InjectModel } from "@nestjs/mongoose";
import { StoreLocation } from "./schema/store-location.schema";
import { Model } from "mongoose";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { TQueryParams } from "src/@types/QueryParams.type";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { locationInjectHelper } from "src/helpers/locationInjectHelper";

@Injectable()
export class StoreLocationService {
    constructor(@InjectModel(StoreLocation.name) private storeLocationModel: Model<StoreLocation>) {}

    async create(storeId: string, createStoreLocationDto: CreateStoreLocationDto) {
        const locationIndex = (await this.storeLocationModel.find({ store: storeId })).length + 1;
        return HandlersFactory.create(this.storeLocationModel, { ...createStoreLocationDto, store: storeId, locationIndex });
    }

    createBulk(storeId: string) {
        //@ts-expect-error just Avoid it to make place holder showing
        return HandlersFactory.create(this.storeLocationModel, locationInjectHelper(storeId));
    }

    async findAll(storeId: string, queryParams: TQueryParams) {
        const apiFeatures = await apiFeaturesHelper(this.storeLocationModel, this.storeLocationModel, queryParams, { store: storeId });
        const documents = await apiFeatures.mongooseQuery;

        return {
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    findOneByPayload(locationId: string, storeId: string) {
        return HandlersFactory.findOneByPayload(this.storeLocationModel, { store: storeId, _id: locationId }, ErrorMessages.NO_LOCATION_FOUND);
    }

    updateOneByPayload(locationId: string, storeId: string, updateStoreLocationDto: UpdateStoreLocationDto) {
        return HandlersFactory.updateOneByPayload(
            this.storeLocationModel,
            { store: storeId, _id: locationId },
            { ...updateStoreLocationDto },
            ErrorMessages.NO_LOCATION_FOUND
        );
    }

    removeOneByPayload(locationId: string, storeId: string) {
        return HandlersFactory.removeOneByPayload(this.storeLocationModel, { store: storeId, _id: locationId }, ErrorMessages.NO_LOCATION_FOUND);
    }

    async removeAllByPayload(storeId: string) {
        await this.storeLocationModel.deleteMany({ store: storeId });
        return { message: "All Locations Removed Successfuly" };
    }
}
