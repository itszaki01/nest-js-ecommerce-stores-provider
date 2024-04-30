import { NotFoundException } from "@nestjs/common";
import { Model } from "mongoose";

export class HandlersFactory {
    static async findAll<T>(Model: Model<T>) {
        const data = await Model.find();
        return data;
    }

    static async create<T>(Model: Model<T>, objectData: T| T[]) {
        const data = await Model.create(objectData);
        return data;
    }

    static async update<T>(Model: Model<T>, objectData: Partial<T>, id: string) {
        const data = await Model.findByIdAndUpdate(id, objectData as object, { new: true });
        if (!data) {
            throw new NotFoundException(`No ${Model.name} for this id: ${id} `);
        }
        return data;
    }

    static async findOne<T>(Model: Model<T>, id: string) {
        const data = await Model.findById(id);
        if (!data) {
            throw new NotFoundException(`No ${Model.name} for this id: ${id} `);
        }
        return data;
    }

    static async remove<T>(Model: Model<T>, id: string) {
        const data = await Model.findByIdAndDelete(id);
        if (!data) {
            throw new NotFoundException(`No ${Model.name} for this id: ${id} `);
        }
        return data;
    }

    static async findOneByPayload<T>(Model: Model<T>, payloadObject: Partial<T>, notFoundMessage: string) {
        const data = await Model.findOne(payloadObject as object);
        if (!data) {
            throw new NotFoundException(notFoundMessage);
        }
        return data;
    }

    static async updateOneByPayload<T>(Model: Model<T>, payloadObject: Partial<T>, objectData: Partial<T>, notFoundMessage: string) {
        const data = await Model.findOneAndUpdate(payloadObject as object, objectData, { new: true });
        if (!data) {
            throw new NotFoundException(notFoundMessage);
        }
        return data;
    }

    static async removeOneByPayload<T>(Model: Model<T>, payloadObject: Partial<T>, notFoundMessage: string) {
        const data = await Model.findOneAndDelete(payloadObject as object);
        if (!data) {
            throw new NotFoundException(notFoundMessage);
        }
        return data;
    }
}
