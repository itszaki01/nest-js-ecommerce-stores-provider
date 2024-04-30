export class EnviromentsClass {
    static get DB_URI() {
        return process.env.DB_URI as string;
    }
    static get NODE_ENV() {
        return process.env.NODE_ENV as "DEV" | "PROD";
    }

    static get JWT_EXP() {
        return process.env.JWT_EXP as string;
    }

    static get APP_NAME() {
        return process.env.APP_NAME as string;
    }

    static get STORE_DEF_PASSWORD() {
        return process.env.STORE_DEF_PASSWORD as string;
    }

    static get JWT_AFFLITA_USER_COMPANY_SECRET() {
        return process.env.JWT_AFFLITA_USER_COMPANY_SECRET as string;
    }

    static get JWT_AFFLITA_USER_STOPDESK_SECRET() {
        return process.env.JWT_AFFLITA_USER_STOPDESK_SECRET as string;
    }

    static get JWT_AFFLITA_USER_STORE_SECRET() {
        return process.env.JWT_AFFLITA_USER_STORE_SECRET as string;
    }

    static get JWT_AFFLITA_USER_CONFIRMATION_SECRET() {
        return process.env.JWT_AFFLITA_USER_CONFIRMATION_SECRET as string;
    }

    static get CDN_URL() {
        return process.env.CDN_URL as string;
    }

    static get COMPANY_BASE_DOMAIN() {
        return process.env.COMPANY_BASE_DOMAIN as string;
    }

    static get COMPNAY_ECO_SYSTEM() {
        return process.env.COMPNAY_ECO_SYSTEM as "safir-click" | "eco-track" | "pro-coli";
    }

    static get SERVER_IP() {
        return process.env.SERVER_IP as string;
    }

    static get COMPNAY_FIXED_STOP_DESK_SIGN_UP_ID() {
        return process.env.COMPNAY_FIXED_STOP_DESK_SIGN_UP_ID as string;
    }

    static get HESTIA_CP_USER() {
        return process.env.HESTIA_CP_USER as string;
    }

    static get SERVER_NS1() {
        return process.env.SERVER_NS1 as string;
    }

    static get SERVER_NS2() {
        return process.env.SERVER_NS2 as string;
    }

    static get MAILER_API_URL() {
        return process.env.MAILER_API_URL as string;
    }

    static get MAIL_FROM_EMAIL() {
        return process.env.MAIL_FROM_EMAIL as string;
    }

    static get SMTP_PASSWORD() {
        return process.env.SMTP_PASSWORD as string;
    }

    static get SMTP_HOST() {
        return process.env.SMTP_HOST as string;
    }

    static get MAIL_POSTMARK_API_KEY() {
        return process.env.MAIL_POSTMARK_API_KEY as string;
    }


    //======================= API SERVICES =========================//

    static get SAFIR_CLICK_API_LINK() {
        return process.env.SAFIR_CLICK_API_LINK as string;
    }
    static get SAFIT_CLICK_API_ATUH_TOKEN() {
        return process.env.SAFIT_CLICK_API_ATUH_TOKEN as string;
    }
    static get SAFIR_CLICK_ALLOW_USERGROUP_ID() {
        return process.env.SAFIR_CLICK_ALLOW_USERGROUP_ID as string;
    }

    // EcoTrack
    static get ECOTACK_API_LINK_COMPANY() {
        return process.env.ECOTACK_API_LINK_COMPANY as string;
    }
}
