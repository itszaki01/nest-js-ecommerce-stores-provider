 type TSafirClickUser = {
    user_id: string;
    user_login: string;
    is_root: string;
    timestamp: string;
    user_type: string;
    status: string;
    firstname: string;
    lastname: string;
    email: string;
    company: string;
    company_id: string;
    phone: string;
    last_login: string;
    company_name: string;
    points: string;
}

export interface ISafirClickUsersRES {
    users:TSafirClickUser[]
}