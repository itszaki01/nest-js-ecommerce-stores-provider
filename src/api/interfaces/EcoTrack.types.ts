export interface IEcoTrackRES {
    tracking: string;
}

export interface IEcoTrackTrackingRES {
    recipientName: string;
    shippedBy: string;
    success:boolean
    originCity: number;
    destLocationCity: number;
    activity: {
        date: string;
        time: string;
        status:
            | "order_information_received_by_carrier"
            | "picked"
            | "accepted_by_carrier"
            | "dispatched_to_driver"
            | "attempt_delivery"
            | "return_asked"
            | "return_in_transit"
            | "Return_received"
            | "livred"
            | "encaissed"
            | "payed";
    }[];
}
