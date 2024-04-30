import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { StoreService } from "../store/store.service";
import { StoreDomainService } from "../store-domain/store-domain.service";

@Injectable()
export class ViewsService {
    constructor(
        private readonly storeService: StoreService,
        private readonly storeDomainService: StoreDomainService
    ) {}

    adminView() {
        const userPath = "../../../public_html/manage-src/index.html";
        const sanitizedPath = path.normalize(userPath);
        const absolutePath = path.join(__dirname, sanitizedPath);
        const data = fs.readFileSync(absolutePath, { encoding: "utf8" });
        return { excludeInterCeptor: true, view: data };
    }

    deskView() {
        const userPath = "../../../public_html/desk-src/index.html";
        const sanitizedPath = path.normalize(userPath);
        const absolutePath = path.join(__dirname, sanitizedPath);
        const data = fs.readFileSync(absolutePath, { encoding: "utf8" });
        return { excludeInterCeptor: true, view: data };
    }

    companyAdminView() {
        const userPath = "../../../public_html/company-admin-src/index.html";
        const sanitizedPath = path.normalize(userPath);
        const absolutePath = path.join(__dirname, sanitizedPath);
        const data = fs.readFileSync(absolutePath, { encoding: "utf8" });
        return { excludeInterCeptor: true, view: data };
    }

    signUpView() {
        const userPath = "../../../public_html/signup-src/index.html";
        const sanitizedPath = path.normalize(userPath);
        const absolutePath = path.join(__dirname, sanitizedPath);
        const data = fs.readFileSync(absolutePath, { encoding: "utf8" });
        return { excludeInterCeptor: true, view: data };
    }

    confirmationServiceView() {
        const userPath = "../../../public_html/confirmation-service-src/index.html";
        const sanitizedPath = path.normalize(userPath);
        const absolutePath = path.join(__dirname, sanitizedPath);
        const data = fs.readFileSync(absolutePath, { encoding: "utf8" });
        return { excludeInterCeptor: true, view: data };
    }

    async publicStoreView(reqHostName: string) {
        let domainName = reqHostName
        let storeId;
        if (EnviromentsClass.NODE_ENV === "DEV") {
            domainName = "localhost";
            storeId = (await this.storeDomainService.findOneByPayload(domainName)).store;
        } else if (domainName.includes(`.${EnviromentsClass.COMPANY_BASE_DOMAIN}`)) {
            domainName = reqHostName.replace(`.${EnviromentsClass.COMPANY_BASE_DOMAIN}`, "");
            storeId = (await this.storeService.findOneByPayload({ storeSubDomain: domainName }))._id.toString();
        } else {
            storeId = (await this.storeDomainService.findOneByPayload(domainName)).store;
        }

        const store = await this.storeService.findOne(storeId)
        const userPath = "../../../public_html/public-src/index.html";
        const sanitizedPath = path.normalize(userPath);
        const absolutePath = path.join(__dirname, sanitizedPath);
        const data = fs.readFileSync(absolutePath, { encoding: "utf8" });
        const newData = data.replace("<!--To-Replace-->",store.headCode);
        return { excludeInterCeptor: true, view: newData };
    }
}
