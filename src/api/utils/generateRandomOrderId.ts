export const generateRandomOrderId = () => {
    const length = 15;
    const charset =
        "ABCDEFGHIJKL012ABCDEFGHIJKL01ABCDEFGHIJKL0123456789MNOPQRSTUVWXYZ012345678923456789MNOPQRSTUVWXYZ01234567893456789MNOABCDEFGHIJKL0123456789MNOPQRSTUVWXYZ0123456789PQRSTUVWXABCDEFGHIJKL0123456789MNOPQRSTUVWXYZ0123456789YZ0123456789";

    let orderid = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        orderid += charset.charAt(randomIndex);
    }

    return orderid;
};
