import { storedefualtStorePages } from "src/constants/storedefualtStorePages";

export const storePagesInjectHelper = (storeId: string) => {
    return storedefualtStorePages.map((page, idx) => {
        page.store = storeId;
        page.pageIndex = idx + 1;
        return page;
    });
};
