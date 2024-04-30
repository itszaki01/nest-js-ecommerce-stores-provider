import { Worker } from "cluster";
import { updater } from "src/updater";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cluster = require("node:cluster");
import * as os from "os";
import writeIsMasterCluster from "src/utils/isMasterCluster";

export class ClusteringService {
    static async startCluster(appBootstrap: () => Promise<void>): Promise<void> {
        
        if (cluster.isPrimary) {
            writeIsMasterCluster("true");
            // Fork workers based on the number of available CPU cores
            const numCPUs = os.cpus();
            for (let i = 0; i < numCPUs.length; i++) {
                cluster.fork();
            }

            cluster.on("exit", (worker: Worker) => {
                console.log(`Worker ${worker.process.pid} died`);
                // Replace the dead worker
                cluster.fork();
            });

            //exec update
            updater();
        } else {
            appBootstrap().catch((err) => {
                console.error(err);
                process.exit(1);
            });
        }
    }
}
