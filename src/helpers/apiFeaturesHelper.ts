import { Model } from "mongoose";
import { TQueryParams } from "src/@types/QueryParams.type";
import { ApiFeatures } from "src/utils/apiFeatures";

export default async <T>(Model: Model<T>, Model2: Model<T>, queryParams: TQueryParams,filterObjet?:object) => {
    const apiFeatures = new ApiFeatures(Model, Model2, queryParams);
    await apiFeatures.filter(filterObjet);
    await apiFeatures.search(queryParams.searchMethod);
    apiFeatures.fieldsLimit();
    apiFeatures.sort();
    apiFeatures.pagination();
    apiFeatures.dateRange()
    
    return apiFeatures;
};
