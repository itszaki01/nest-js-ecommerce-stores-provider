import mongoose, { Model } from "mongoose";
import { TQueryParams, TQuerySortParams } from "../@types/QueryParams.type";
import { TPaginateResults } from "../@types/ResponseData.type";
import { BadRequestException } from "@nestjs/common";

export class ApiFeatures<T> {
    totalResults = 0;
    constructor(
        public mongooseQuery: mongoose.FilterQuery<T>,
        public mongooseModel: Model<T>,
        public queryString: TQueryParams,
        public paginateResults?: TPaginateResults
    ) {}
    async filter(filterBy?: TQueryParams) {
        if (!this.queryString.keyword) {
            //1:Filters
            const queryFilters = { ...this.queryString } as TQueryParams;
            const querySortParams: TQuerySortParams = ["limit", "page", "sort", "fields", "dateRange", "searchKey"];
            querySortParams.forEach((key) => delete queryFilters[key]);
            //apply filtraion with [get,gt,lte,lt]
            const queryStr = JSON.stringify(queryFilters).replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
            if (!filterBy) {
                this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
                this.totalResults = await this.mongooseModel.countDocuments(JSON.parse(queryStr));
            } else {
                this.mongooseQuery = this.mongooseQuery.find(filterBy);
                this.totalResults = await this.mongooseModel.countDocuments(filterBy);
            }
        }
        return this;
    }

    sort() {
        //4:sortBy
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.replace(/,/g, " ");
            this.mongooseQuery.sort(sortBy);
        } else {
            this.mongooseQuery.sort("-createdAt");
        }
        return this;
    }

    dateRange() {
        //5:sortBy
        if (this.queryString.dateRange) {
            const rangeArray = this.queryString.dateRange.split("to");
            if (!rangeArray[1]) throw new BadRequestException("يرجى تحديد تاريخ صحيح");
            this.mongooseQuery.where("createdAt").gte(new Date(rangeArray[0])).lt(new Date(rangeArray[1]));
        }
        return this;
    }

    fieldsLimit() {
        //6:Fileds Limiting
        if (this.queryString.fields) {
            const fields = this.queryString.fields.replace(/,/g, " ");
            this.mongooseQuery.select(fields);
        } else {
            this.mongooseQuery.select("-__v -password -passwordChangedAt -twoFactorySecretCode -twoFactoryQr -specialGoogleSheetsApiKey");
        }
        return this;
    }

    async search(
        searchMethod?: "ByPhoneNumber" | "ByClientName" | "ByClientEmail" | "ByClientStoreName" | "ByStopDeskName" | "ByUserName" | "Custom",
        payload?: TQueryParams
    ) {
        if (this.queryString.keyword) {
            const keyword = this.queryString.keyword;
            let query = {};
            if (searchMethod === "ByPhoneNumber") {
                query = {
                    $or: [{ clientPhoneNumber: { $regex: keyword, $options: "i" } }],
                };
            } else if (searchMethod === "ByClientName") {
                query = {
                    clientName: { $regex: keyword, $options: "i" },
                    ...payload,
                };
            } else if (searchMethod === "ByClientStoreName") {
                query = {
                    storeName: { $regex: keyword, $options: "i" },
                    ...payload,
                };
            } else if (searchMethod === "ByStopDeskName") {
                query = {
                    stopDeskName: { $regex: keyword, $options: "i" },
                    ...payload,
                };
            } else if (searchMethod === "ByUserName") {
                query = {
                    userName: { $regex: keyword, $options: "i" },
                    ...payload,
                };
            } else if (searchMethod === "Custom" && this.queryString.searchKey) {
                query = {
                    [this.queryString.searchKey]: { $regex: keyword, $options: "i" },
                    ...payload,
                };
            } else {
                query = {
                    clientPhoneNumber: { $regex: keyword, $options: "i" },
                    ...payload,
                };
            }

            this.mongooseQuery = this.mongooseQuery.find(query);
            this.totalResults = await this.mongooseModel.countDocuments(query);
        }
        return this;
    }

    pagination() {
        const page = Number(this.queryString.page) || 1;
        const limit = Number(this.queryString.limit) || 250;
        const skip = (page - 1) * limit;
        const totalPages = Math.ceil(this.totalResults / limit);
        this.paginateResults = {
            limit: limit,
            currentPage: page,
            totalPages: Math.ceil(this.totalResults / limit),
            totalResults: this.totalResults,
            next: page === totalPages ? null : page + 1,
            prev: page - 1 === 0 ? null : page - 1,
        };
        this.mongooseQuery.skip(skip).limit(limit);
        return this;
    }
}
