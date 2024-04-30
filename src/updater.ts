import { execSync } from "child_process";
import { EnviromentsClass } from "./utils/enviromentsClass";

export const updater = () => {
    //updaters
    setInterval(
        () => {
            if (EnviromentsClass.NODE_ENV === "DEV") return;
            try {
                const output = execSync("git pull", { encoding: "utf-8" });
                if (output.toLocaleLowerCase().includes("updating")) {
                    console.log("updating");
                    execSync("npm install --force", { encoding: "utf-8" });
                    process.exit(1);
                } else if (output.toLocaleLowerCase().includes("already")) {
                    console.log("back end is up-to-date");
                } else {
                    process.exit(1);
                }
            } catch (error) {
                const _erorr = error as Error;
                console.log(_erorr.message);
            }
        },
        10000 * 6 * 1
    );

    //UPDATER
    setInterval(
        () => {
            if (EnviromentsClass.NODE_ENV === "DEV") return;
            try {
                const output = execSync("git -C ../public_html pull", { encoding: "utf-8" });
                if (output.toLocaleLowerCase().includes("updating")) {
                    console.log("updating");
                } else {
                    console.log("front end is up-to-date");
                }
            } catch (error) {
                const _erorr = error as Error;
                console.log(_erorr.message);
            }
        },
        10000 * 6 * 1
    );
};
