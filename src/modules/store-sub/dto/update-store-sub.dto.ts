import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreSubDto } from './create-store-sub.dto';
import { Exclude } from 'class-transformer';

export class UpdateStoreSubDto extends PartialType(CreateStoreSubDto) {
    @Exclude()
    password?: string | undefined;
}
