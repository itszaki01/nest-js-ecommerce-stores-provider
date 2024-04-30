import { Controller, Get, Body, Patch, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { StoreApplicationsService } from "./store-applications.service";
import { UpdateStoreApplicationDto } from "./dto/update-store-application.dto";
import { UserStoreAuth } from "../auth-store-user/decorator/user-store-auth.decorator";
import { StoreUser } from "../auth-store-user/decorator/store-user.decorator";
import { StoreService } from "../store/store.service";

@UserStoreAuth("StoreAdmin")
@Controller("store-applications")
export class StoreApplicationsController {
    constructor(
        private readonly storeApplicationsService: StoreApplicationsService,
        private readonly storeService: StoreService
    ) {}

    // @Post()
    // create(@Body() createStoreApplicationDto: CreateStoreApplicationDto) {
    //   return this.storeApplicationsService.create(createStoreApplicationDto);
    // }

    // @Get()
    // findAll(@Query() queryParams: TQueryParams, @StoreUser("storeId") storeId: string) {
    //     return this.storeApplicationsService.findAll(storeId, queryParams);
    // }

    @Get()
    findOne(@StoreUser("storeId") storeId: string) {
        return this.storeApplicationsService.findOneByPayload(storeId);
    }

    @Patch()
    async update(@StoreUser("storeId") storeId: string, @Body() updateStoreApplicationDto: UpdateStoreApplicationDto) {
        const store = await this.storeService.findOne(storeId);

        //1:Check if is pro
        if (store.storeSubcreption !== "pro") {
            throw new UnauthorizedException("يجب ترقية متجرك إلى باقة PRO لإستعمال هاذه الخاصية");
        }

        //2:check google sheets is not > 10
        if (updateStoreApplicationDto.googleSheetsApis && updateStoreApplicationDto.googleSheetsApis?.length > 10) {
            throw new BadRequestException("لايمكن إستعمال أكثر من 10 Google Sheet API");
        }

        //2:check facebook apis is not > 10
        if (updateStoreApplicationDto.facebookConvApis && updateStoreApplicationDto.facebookConvApis?.length > 10) {
            throw new BadRequestException("لايمكن إستعمال أكثر من 10 Facebook Conversion API");
        }

        return this.storeApplicationsService.updateOneByPayload(storeId, updateStoreApplicationDto);
    }

    // @Delete(':id')
    // remove(@Param('id') id: string) {
    //   return this.storeApplicationsService.remove(+id);
    // }
}
