import * as fs from 'fs'
import * as path from 'path'

export default function writeIsMasterCluster(value:string){
    const filename = 'isMaster.txt';
    const filePath = path.join(__dirname, filename);
    fs.writeFile(filePath, value, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File written successfully');
        }
    });
}