import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreDomainDto } from './create-store-domain.dto';

export class UpdateStoreDomainDto extends PartialType(CreateStoreDomainDto) {}
