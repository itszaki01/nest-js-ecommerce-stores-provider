export type TQuerySortParams = ["limit", "page", "sort", "fields", "dateRange", "searchKey"];
export type TQueryParams = {
    id?: string;
    limit?: string;
    page?: string;
    sort?: string;
    searchMethod?: "ByPhoneNumber" | "ByClientName" | "ByClientEmail" | "ByClientStoreName" | "Custom";
    fields?: string;
    dateRange?: string;
    keyword?: string;
    searchKey?: string;
};
