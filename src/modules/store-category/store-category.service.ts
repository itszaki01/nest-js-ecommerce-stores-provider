import { Injectable } from "@nestjs/common";
import { CreateStoreCategoryDto } from "./dto/create-store-category.dto";
import { UpdateStoreCategoryDto } from "./dto/update-store-category.dto";
import { HandlersFactory } from "src/utils/handlersFactory";
import { StoreCategory } from "./schema/store-category.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { TQueryParams } from "src/@types/QueryParams.type";
import { ErrorMessages } from "src/constants/ErrorMessage";

@Injectable()
export class StoreCategoryService {
    constructor(@InjectModel(StoreCategory.name) private storeCategoryModel: Model<StoreCategory>) {}

    create(createStoreCategoryDto: CreateStoreCategoryDto, storeId: string) {
        return HandlersFactory.create(this.storeCategoryModel, { ...createStoreCategoryDto, store: storeId });
    }

    async findAll(storeId: string, queryParams: TQueryParams) {
        const apiFeatures = await apiFeaturesHelper(this.storeCategoryModel, this.storeCategoryModel, queryParams, { store: storeId });
        const documents = await apiFeatures.mongooseQuery;

        return {
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    findOneByPayload(categoryId: string, storeId: string) {
        return HandlersFactory.findOneByPayload(this.storeCategoryModel, { store: storeId, _id: categoryId }, ErrorMessages.NO_CATEGORY_FOUND);
    }

    updateOneByPayload(categoryId: string, storeId: string, updateStoreCategoryDto: UpdateStoreCategoryDto) {
        return HandlersFactory.updateOneByPayload(
            this.storeCategoryModel,
            { store: storeId, _id: categoryId },
            { ...updateStoreCategoryDto },
            ErrorMessages.NO_CATEGORY_FOUND
        );
    }

    removeOneByPayload(categoryId: string, storeId: string) {
        return HandlersFactory.removeOneByPayload(this.storeCategoryModel, { store: storeId, _id: categoryId }, ErrorMessages.NO_CATEGORY_FOUND);
    }
}
