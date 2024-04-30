import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Company } from "./schema/company.schema";
import { Model } from "mongoose";
import { HandlersFactory } from "src/utils/handlersFactory";

@Injectable()
export class CompanyService {
    constructor(@InjectModel(Company.name) private companyModel: Model<Company>) {}
    async create(createCompanyDto: CreateCompanyDto) {
        //1: chack if company created before
        const company = await this.companyModel.find({});
        if (company.length > 0) {
            throw new BadRequestException("Company Profile Already Exist");
        }
        return HandlersFactory.create(this.companyModel, { ...createCompanyDto, dailyCheckerDate: new Date(Date.now()) });
    }

    async findeOne() {
        const company = await this.companyModel.find({});
        return company[0];
    }

    async update(updateCompanyDto: UpdateCompanyDto) {
        const company = await this.companyModel.find({});
        if (company.length == 0) {
            throw new BadRequestException("Company Profile Not Exist");
        }
        return await this.companyModel.findByIdAndUpdate(company[0]._id, { ...updateCompanyDto }, { new: true });
    }

    // async remove() {
    //     const company = await this.companyModel.find({});
    //     if (company.length == 0) {
    //         throw new BadRequestException("Company Profile Not Exist");
    //     }
    //     await this.companyModel.findByIdAndDelete(company[0]._id);
    //     return { messag: "Company Profile Removed Successfuly" };
    // }
}
