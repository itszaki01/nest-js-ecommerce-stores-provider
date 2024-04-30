import { Controller, Get, Req, Res } from "@nestjs/common";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { ViewsService } from "./views.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { JwtTokenService } from "src/common/services/jwtToken.service";

@Controller("/")
export class ViewsController {
    constructor(
        private readonly viewsService: ViewsService,
        private readonly jwtTokenService: JwtTokenService
    ) {}

    @Get()
    async findAll(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        let domainName = req.hostname;
        if (domainName.includes(`.${EnviromentsClass.COMPANY_BASE_DOMAIN}`)) {
            domainName = req.hostname.replace(`.${EnviromentsClass.COMPANY_BASE_DOMAIN}`, "");
            if (domainName === "company") {
                res.redirect(303, "/company-admin");
                return { message: "success" };
            } else if (domainName === "manage") {
                res.redirect(303, "/manage");
                return { message: "success" };
            } else if (domainName === "admin") {
                res.redirect(303, "/manage");
                return { message: "success" };
            } else if (domainName === "members") {
                res.redirect(303, "/confirmation-service");
                return { message: "success" };
            } else if (domainName === "desk") {
                res.redirect(303, "/desk");
                return { message: "success" };
            } else if (domainName === "signup") {
                res.redirect(303, "/signup");
                return { message: "success" };
            } else {
                res.header("Content-Type", "text/html; charset=UTF-8");
                res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
                return this.viewsService.publicStoreView(req.hostname);
            }
        } else {
            res.header("Content-Type", "text/html; charset=UTF-8");
            res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
            return this.viewsService.publicStoreView(req.hostname);
        }
    }

    @Get("thankyou")
    async thankyou(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return this.viewsService.publicStoreView(req.hostname);
    }

    @Get("page/:pageId")
    async find(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return this.viewsService.publicStoreView(req.hostname);
    }

    @Get("p/:productId")
    async pageRoute(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return this.viewsService.publicStoreView(req.hostname);
    }

    @Get("manage")
    mainAdmin(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return this.viewsService.adminView();
    }

    @Get("manage/*")
    adminView(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return this.viewsService.adminView();
    }

    @Get("signup")
    signUpView(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return this.viewsService.signUpView();
    }

    @Get("desk")
    mainDeskView(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return this.viewsService.deskView();
    }

    @Get("desk/*")
    deskView(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return this.viewsService.deskView();
    }

    @Get("company-admin")
    mainCompanyView(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return this.viewsService.companyAdminView();
    }
    @Get("company-admin/*")
    companyAdminView(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return this.viewsService.companyAdminView();
    }

    @Get("confirmation-service")
    confirmationServiceMainView(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return this.viewsService.confirmationServiceView();
    }

    @Get("confirmation-service/*")
    confirmationServiceView(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
        res.header("Content-Type", "text/html; charset=UTF-8");
        res.setCookie("XSRF-TOKEN", this.jwtTokenService.signCsrfJWT(), { path: "/" });
        return this.viewsService.confirmationServiceView();
    }
}
