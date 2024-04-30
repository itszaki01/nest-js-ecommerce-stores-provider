export const promiseWait = (timeInSecends: number = 2) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve("");
        }, 1000 * timeInSecends);
    });
