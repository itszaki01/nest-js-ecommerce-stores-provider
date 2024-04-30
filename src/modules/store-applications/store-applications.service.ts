import { Injectable } from "@nestjs/common";
import { CreateStoreApplicationDto } from "./dto/create-store-application.dto";
import { UpdateStoreApplicationDto } from "./dto/update-store-application.dto";
import { HandlersFactory } from "src/utils/handlersFactory";
import { InjectModel } from "@nestjs/mongoose";
import { StoreApplications } from "./scheam/store-application.schema";
import { Model } from "mongoose";

@Injectable()
export class StoreApplicationsService {
    constructor(@InjectModel(StoreApplications.name) private storeApplicationsModel: Model<StoreApplications>) {}
    // create(createStoreCategoryDto: CreateStoreApplicationDto, storeId: string) {
    //     return HandlersFactory.create(this.storeApplicationsModel, { ...createStoreCategoryDto, store: storeId });
    // }

    // async findAll(storeId: string, queryParams: TQueryParams) {
    //     const apiFeatures = await apiFeaturesHelper(this.storeApplicationsModel, this.storeApplicationsModel, queryParams, { store: storeId });
    //     const documents = await apiFeatures.mongooseQuery;

    //     return {
    //         ...apiFeatures.paginateResults,
    //         documents,
    //     };
    // }

    findOneByPayload(storeId: string) {
        return HandlersFactory.findOneByPayload(this.storeApplicationsModel, { store: storeId }, "لم يتم العثور على التطبيقات");
    }

    async updateOneByPayload(storeId: string, updateStoreApplicationDto: UpdateStoreApplicationDto) {
        //1:check if storeApplications Exist ==> if not create one
        const storeApplicatins = await this.storeApplicationsModel.findOne({ store: storeId });
        if (!storeApplicatins) {
            return await HandlersFactory.create(this.storeApplicationsModel, {
                ...(updateStoreApplicationDto as CreateStoreApplicationDto),
                store: storeId,
            });
        }

        return await HandlersFactory.updateOneByPayload(
            this.storeApplicationsModel,
            { store: storeId },
            { ...updateStoreApplicationDto },
            "لم يتم العثور على التطبيقات"
        );
    }
}
