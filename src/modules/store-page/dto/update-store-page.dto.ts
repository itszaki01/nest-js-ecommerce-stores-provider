import { PartialType } from '@nestjs/mapped-types';
import { CreateStorePageDto } from './create-store-page.dto';

export class UpdateStorePageDto extends PartialType(CreateStorePageDto) {}
