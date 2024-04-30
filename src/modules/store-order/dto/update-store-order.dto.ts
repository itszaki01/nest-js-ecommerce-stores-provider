import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreOrderDto } from './create-store-order.dto';

export class UpdateStoreOrderDto extends PartialType(CreateStoreOrderDto) {
}
