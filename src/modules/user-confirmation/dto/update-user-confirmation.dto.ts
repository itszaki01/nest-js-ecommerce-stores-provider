import { PartialType } from "@nestjs/mapped-types";
import { CreateUserConfirmationDto } from "./create-user-confirmation.dto";

export class UpdateUserConfirmationDto extends PartialType(CreateUserConfirmationDto) {}
