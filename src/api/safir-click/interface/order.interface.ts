export interface IOrderData {
    order_id: string;
    company_id: string;
    user_id: string;
    total: string;
    profit: string;
    shipping_ids: string;
    shipping_cost: string;
    status: string;
    notes: string;
    details: string;
    firstname: string;
    lastname: string;
    b_firstname: string;
    b_lastname: string;
    b_address: string;
    b_address_2: string;
    b_city: string;
    b_county: string;
    b_state: string;
    b_country: string;
    b_zipcode: string;
    b_phone: string;
    s_firstname: string;
    s_lastname: string;
    s_address: string;
    s_address_2: string;
    s_city: string;
    s_county: string;
    s_state: string;
    s_country: string;
    s_zipcode: string;
    s_phone: string;
    s_address_type: string;
    phone: string;
    cp_total_order_profit: string;
    products: object;
}

export interface OrderSafirClickRES {
    order_id: number;
    order_data: IOrderData;
}
