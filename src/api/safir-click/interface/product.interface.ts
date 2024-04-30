type TProductSafirClick = {
    product_id: string;
    product: string;
    product_code: string;
    status: string;
    company_id: string;
    list_price: string;
    amount: string;
    cp_min_profit_value: string;
    cp_profit_value: string;
    price: string;
};


export interface IProductSafiClickRES {
    products:TProductSafirClick[]
}