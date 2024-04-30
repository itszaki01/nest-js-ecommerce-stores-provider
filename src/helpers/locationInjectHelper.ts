import storeDefualtLocations from "src/constants/storeDefualtLocations";

export const locationInjectHelper = (storeId: string) => {
    return storeDefualtLocations.map((location, idx) => {
        location.store = storeId;
        location.locationIndex = idx + 1;
        return location;
    });
};
