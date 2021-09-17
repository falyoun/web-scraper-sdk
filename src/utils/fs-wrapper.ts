import * as fs from "fs";
export const createDirectoryIfItDoesNotExist = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
}
