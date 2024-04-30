import { Controller, Get, Post, Body, Patch, UseGuards, Res } from "@nestjs/common";
import { CompanyService } from "./company.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { FastifyReply } from "fastify";
import { JwtTokenService } from "src/common/services/jwtToken.service";
import { promiseWait } from "src/helpers/promiseWait";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { SudoAuthGuard } from "./guards/sudo-auth.guard";
import { SkipThrottle } from "@nestjs/throttler";


@SkipThrottle()
@Controller("company")
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService,
        private readonly jwtTokenService: JwtTokenService
    ) {}

    @UseGuards(SudoAuthGuard)
    @Post()
    create(@Body() createCompanyDto: CreateCompanyDto) {
        return this.companyService.create(createCompanyDto);
    }

    @Get()
    findeOne() {
        return this.companyService.findeOne();
    }

    @UseGuards(SudoAuthGuard)
    @Patch()
    update(@Body() updateCompanyDto: UpdateCompanyDto) {
        return this.companyService.update(updateCompanyDto);
    }

    @Get("refresh")
    async refreshToken(@Res({ passthrough: true }) res: FastifyReply) {

        if (EnviromentsClass.NODE_ENV === "DEV") {
            return "success";
        }
        await promiseWait(5);
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return "success";
    }
}
