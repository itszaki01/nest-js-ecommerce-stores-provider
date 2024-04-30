import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateStoreProductDto } from "./dto/create-store-product.dto";
import { UpdateStoreProductDto } from "./dto/update-store-product.dto";
import { HandlersFactory } from "src/utils/handlersFactory";
import { InjectModel } from "@nestjs/mongoose";
import { StoreProduct } from "./schema/store-product.schema";
import { Model } from "mongoose";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { TQueryParams } from "src/@types/QueryParams.type";
import { ErrorMessages } from "src/constants/ErrorMessage";

@Injectable()
export class StoreProductService {
    constructor(@InjectModel(StoreProduct.name) private storeProductModel: Model<StoreProduct>) {}
    
    async create(createStoreProductDto: CreateStoreProductDto, storeId: string) {
        //1:Check if product slug is unique
        const product = await this.storeProductModel.findOne({ slug: createStoreProductDto.slug, store: storeId });
        if (product) {
            throw new BadRequestException(ErrorMessages.LINK_DUPLICATED);
        }

        //2:Create Product
        return HandlersFactory.create(this.storeProductModel, { ...createStoreProductDto, store: storeId });
    }

    async findAll(storeId: string, queryParams: TQueryParams) {
        const apiFeatures = await apiFeaturesHelper(this.storeProductModel, this.storeProductModel, queryParams, { store: storeId });
        const documents = await apiFeatures.mongooseQuery;

        return {
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    findOneByPayload(productId: string, storeId: string) {
        return HandlersFactory.findOneByPayload(this.storeProductModel, { store: storeId, _id: productId }, ErrorMessages.NO_PRODUCT_FOUND);
    }

    async updateOneByPayload(productId: string, storeId: string, updateStoreProductDto: UpdateStoreProductDto) {
        //1:check slug is unique for update
        const product = await this.storeProductModel.findOne({ store: storeId, _id: productId });
        if (updateStoreProductDto.slug != product?.slug) {
            const product = await this.storeProductModel.findOne({ slug: updateStoreProductDto.slug, store: storeId });
            if (product) {
                throw new BadRequestException(ErrorMessages.LINK_DUPLICATED);
            }
        }

        //2:Update
        return HandlersFactory.updateOneByPayload(
            this.storeProductModel,
            { store: storeId, _id: productId },
            { ...updateStoreProductDto },
            ErrorMessages.NO_PRODUCT_FOUND
        );
    }

    removeOneByPayload(productId: string, storeId: string) {
        return HandlersFactory.removeOneByPayload(this.storeProductModel, { store: storeId, _id: productId }, ErrorMessages.NO_PRODUCT_FOUND);
    }
}
