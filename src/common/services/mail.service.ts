import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CompanyService } from "src/modules/company/company.service";
import { UserStoreService } from "src/modules/user-store/user-store.service";
import { resetPasswordTemplate } from "../templates/reset-password.template";
import { JwtTokenService } from "./jwtToken.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { UserCompany } from "src/modules/user-company/schema/user-company.schema";
import { userLoginDetials } from "../templates/user-login-detials.template";
import { sendEmail } from "src/utils/sendEmail";
import { UserStopDesk } from "src/modules/user-stop-desk/schema/user-stop-desk.schema";
import { UserStore } from "src/modules/user-store/schema/user-store.schema";
import { userStoreLoginTemplate } from "../templates/user-store-login.template";
import { UserConfirmation } from "src/modules/user-confirmation/schema/user-confirmation.schema";
import { userConfirmationLoginDetials } from "../templates/user-confirmation.template";

@Injectable()
export class MailService {
    mailerApi = EnviromentsClass.MAILER_API_URL;
    headers = {
        "x-afflita-mail-token":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJzdWRvLXVzZXIiLCJpYXQiOjE3MDkzMDAxMDB9.j_aY8JkoCZwj80i9kfhNxbXrG9xvZ6jsAh_uHhcDBEE",
    };
    constructor(
        private readonly companyService: CompanyService,
        private readonly userStoreService: UserStoreService,
        private readonly jwtTokenService: JwtTokenService
    ) {}

    async sendResetPasswordEmail(email: string) {
        const user = await this.userStoreService.findOneByPayload({ email }, "لم يتم العثور على أي مستخدم بهذا الإيميل");
        const company = await this.companyService.findeOne();
        const resetToken = this.jwtTokenService.signResetPasswordJWT(
            { userId: user._id.toString(), role: user.role, storeId: user.store },
            EnviromentsClass.JWT_AFFLITA_USER_STORE_SECRET
        );

        const emailMessage = resetPasswordTemplate
            .replace("##COMPANY-FRNAME##", company.companyNameFr)
            .replace("##COMPANY-LOGO##", company.logo)
            .replace("##COMPANY-BASEURL##", company.compnayBaseUrl)
            .replace("##USER-NAME##", user.userName)
            .replace("##RESET-PASSWORD-LINK##", `https://manage.${company.compnayBaseUrl}/manage/reset-password?token=${resetToken}`);

        const mailObj = {
            to: email,
            fromName: company.companyNameFr,
            subject: "إعادة تعيين كلمة المرور",
            text: emailMessage,
        };

        try {
            await sendEmail(mailObj);
            return { message: "mail sent success" };
        } catch (error) {
            throw new InternalServerErrorException("حدث خطأ أثانء محاولة إرسال إيميل إعادة تعيين كلمة المرور");
        }
    }

    async sendUserCompanyLoginDetialsEmail(user: UserCompany, password: string) {
        const company = await this.companyService.findeOne();

        const emailMessage = userLoginDetials
            .replace("##COMPANY-FRNAME##", company.companyNameFr)
            .replace("##COMPANY-LOGO##", company.logo)
            .replace("##COMPANY-BASEURL##", company.compnayBaseUrl)
            .replace("##USER-NAME##", user.name)
            .replace("##USER-EMAIL##", user.email)
            .replace("##PASSWORD##", password)
            .replace("##SECRET-CODE-2FA##", user.twoFactorySecretCode)
            .replace("##QR-CODE-LINK##", user.twoFactoryQr)
            .replaceAll("##LOGIN-LINK##", `https://company.${company.compnayBaseUrl}`);

        const mailObj = {
            to: user.email,
            fromName: company.companyNameFr,
            subject: "معلومات تسجيل الدخول لحساب الشركة",
            text: emailMessage,
        };

        try {
            await sendEmail(mailObj);
            return { message: "mail sent success" };
        } catch (error) {
            throw new InternalServerErrorException("حدث خطأ أثانء محاولة إرسال إيميل معلومات تسجيل الدخول");
        }
    }

    async sendUserStopDeskLoginDetialsEmail(user: UserStopDesk, password: string) {
        const company = await this.companyService.findeOne();

        const emailMessage = userLoginDetials
            .replace("##COMPANY-FRNAME##", company.companyNameFr)
            .replace("##COMPANY-LOGO##", company.logo)
            .replace("##COMPANY-BASEURL##", company.compnayBaseUrl)
            .replace("##USER-NAME##", user.stopDeskName)
            .replace("##USER-EMAIL##", user.email)
            .replace("##PASSWORD##", password)
            .replace("##SECRET-CODE-2FA##", user.twoFactorySecretCode)
            .replace("##QR-CODE-LINK##", user.twoFactoryQr)
            .replaceAll("##LOGIN-LINK##", `https://desk.${company.compnayBaseUrl}`);

        const mailObj = {
            to: user.email,
            fromName: company.companyNameFr,
            subject: "معلومات تسجيل الدخول لحساب المكتب",
            text: emailMessage,
        };

        try {
            await sendEmail(mailObj);
            return { message: "mail sent success" };
        } catch (error) {
            throw new InternalServerErrorException("حدث خطأ أثانء محاولة إرسال إيميل معلومات تسجيل الدخول");
        }
    }

    async sendUserConfirmationLoginDetialsEmail(user: UserConfirmation, password: string) {
        const company = await this.companyService.findeOne();

        const emailMessage = userConfirmationLoginDetials
            .replace("##COMPANY-FRNAME##", company.companyNameFr)
            .replace("##COMPANY-LOGO##", company.logo)
            .replace("##COMPANY-BASEURL##", company.compnayBaseUrl)
            .replace("##USER-NAME##", user.userName)
            .replace("##USER-EMAIL##", user.email)
            .replace("##PASSWORD##", password)
            .replace("##SECRET-CODE-2FA##", user.twoFactorySecretCode)
            .replace("##QR-CODE-LINK##", user.twoFactoryQr)
            .replace("##CASH-SECRET##", user.cashSecretCode)
            .replaceAll("##LOGIN-LINK##", `https://members.${company.compnayBaseUrl}`);

        const mailObj = {
            to: user.email,
            fromName: company.companyNameFr,
            subject: "معلومات تسجيل الدخول للوحة تأكيد الطلبات",
            text: emailMessage,
        };

        try {
            await sendEmail(mailObj);
            return { message: "mail sent success" };
        } catch (error) {
            throw new InternalServerErrorException("حدث خطأ أثانء محاولة إرسال إيميل معلومات تسجيل الدخول");
        }
    }

    async sendUserStoreLoginDetialsEmail(user: UserStore, password: string) {
        const company = await this.companyService.findeOne();

        const emailMessage = userStoreLoginTemplate
            .replace("##COMPANY-FRNAME##", company.companyNameFr)
            .replace("##COMPANY-LOGO##", company.logo)
            .replace("##USER-NAME##", user.userName)
            .replace("##USER-EMAIL##", user.email)
            .replace("##PASSWORD##", password)
            .replaceAll("##COMPANY-BASEURL##", company.compnayBaseUrl)
            .replaceAll("##LOGIN-LINK##", `https://manage.${company.compnayBaseUrl}`)
            .replaceAll("##THEME-COLOR##", company.themeColor)
            .replaceAll("##TEXT-COLOR##", company.textColor);

        const mailObj = {
            to: user.email,
            fromName: company.companyNameFr,
            subject: "معلومات تسجيل الدخول للمتجر الإلكتروني",
            text: emailMessage,
        };

        try {
            await sendEmail(mailObj);
            return { message: "mail sent success" };
        } catch (error) {
            throw new InternalServerErrorException("حدث خطأ أثانء محاولة إرسال إيميل معلومات تسجيل الدخول");
        }
    }

    async sendUserSubStoreLoginDetialsEmail(user: UserStore, password: string,storeSubDomain:string) {
        const company = await this.companyService.findeOne();

        const emailMessage = userStoreLoginTemplate
            .replace("##COMPANY-FRNAME##", company.companyNameFr)
            .replace("##COMPANY-LOGO##", company.logo)
            .replace("##USER-NAME##", user.userName)
            .replace("##USER-EMAIL##", user.email)
            .replace("##PASSWORD##", password)
            .replaceAll("##COMPANY-BASEURL##", company.compnayBaseUrl)
            .replaceAll("##LOGIN-LINK##", `https://${storeSubDomain}.${company.compnayBaseUrl}/manage`)
            .replaceAll("##THEME-COLOR##", company.themeColor)
            .replaceAll("##TEXT-COLOR##", company.textColor);

        const mailObj = {
            to: user.email,
            fromName: company.companyNameFr,
            subject: "معلومات تسجيل الدخول للمتجر الإلكتروني",
            text: emailMessage,
        };

        try {
            await sendEmail(mailObj);
            return { message: "mail sent success" };
        } catch (error) {
            throw new InternalServerErrorException("حدث خطأ أثانء محاولة إرسال إيميل معلومات تسجيل الدخول");
        }
    }
}
