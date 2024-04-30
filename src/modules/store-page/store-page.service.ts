import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateStorePageDto } from "./dto/create-store-page.dto";
import { UpdateStorePageDto } from "./dto/update-store-page.dto";
import { InjectModel } from "@nestjs/mongoose";
import { StorePage } from "./schema/store-page.schema";
import { Model } from "mongoose";
import { HandlersFactory } from "src/utils/handlersFactory";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { TQueryParams } from "src/@types/QueryParams.type";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { storePagesInjectHelper } from "src/helpers/storePagesInjectHelper";

@Injectable()
export class StorePageService {
    constructor(@InjectModel(StorePage.name) private storePageModel: Model<StorePage>) {}

    async create(createStorePageDto: CreateStorePageDto, storeId: string) {
        //1: make sure slug is uniqe
        const page = await this.storePageModel.findOne({ store: storeId, slug: createStorePageDto.slug });
        if (page) {
            throw new BadRequestException(ErrorMessages.LINK_DUPLICATED);
        }

        //2: Generate pageIndex
        const pageIndex = (await this.storePageModel.find({ store: storeId })).length + 1;

        //3: create store page
        return HandlersFactory.create(this.storePageModel, { ...createStorePageDto, store: storeId, pageIndex });
    }

    createDemo(storeId: string) {
        return HandlersFactory.create(this.storePageModel, storePagesInjectHelper(storeId));
    }

    async findAll(storeId: string, queryParams: TQueryParams) {
        const apiFeatures = await apiFeaturesHelper(this.storePageModel, this.storePageModel, queryParams, { store: storeId });
        const documents = await apiFeatures.mongooseQuery;

        return {
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    findOneByPayload(pageId: string, storeId: string) {
        return HandlersFactory.findOneByPayload(this.storePageModel, { store: storeId, _id: pageId }, ErrorMessages.NO_PAGE_FOUND);
    }

    async updateOneByPayload(pageId: string, storeId: string, updateStorePageDto: UpdateStorePageDto) {
        //1:check slug is unique for update
        const page = await this.storePageModel.findOne({ store: storeId, _id: pageId });
        if (updateStorePageDto.slug != page?.slug) {
            const page = await this.storePageModel.findOne({ slug: updateStorePageDto.slug, store: storeId });
            if (page) {
                throw new BadRequestException(ErrorMessages.LINK_DUPLICATED);
            }
        }

        //2:update
        return HandlersFactory.updateOneByPayload(
            this.storePageModel,
            { store: storeId, _id: pageId },
            { ...updateStorePageDto },
            ErrorMessages.NO_PAGE_FOUND
        );
    }

    removeOneByPayload(pageId: string, storeId: string) {
        return HandlersFactory.removeOneByPayload(this.storePageModel, { store: storeId, _id: pageId }, ErrorMessages.NO_PAGE_FOUND);
    }
}
