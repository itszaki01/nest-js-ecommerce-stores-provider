import * as fs from "fs";
import * as path from "path";
export default function readMasterClusterFile() {
    const filename = "isMaster.txt";
    const filePath = path.join(__dirname, filename);

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return fileContent;
    } catch (err) {
        throw new Error(err.message)
    }

}
