import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreApplicationDto } from './create-store-application.dto';

export class UpdateStoreApplicationDto extends PartialType(CreateStoreApplicationDto) {}
