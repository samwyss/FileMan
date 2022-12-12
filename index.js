import fs from "fs";

//TODO: Clean up and optimize code
//TODO: Look into target directory and look for last file name so the rename to move command also names it appropriately, does it need randomized at all if this is done?

function randomString() {
    return new Promise((resolve, reject) => {
        resolve(Math.random().toString(36).slice(2));
    });
}

function getNewFileAttributes(path, randName) {
    return new Promise((resolve, reject) => {
        let pathArray = path.split("/");
        let parentDirectory = pathArray.slice(0, -1).join("/");
        let fileName = pathArray.pop(1);
        let fileExtension = fileName.split(".").pop(1);
        let combinedFileName = randName + "." + fileExtension;
        let newPath = parentDirectory + "/" + combinedFileName;
        const fileAttributes = {
            path: newPath,
            name: combinedFileName,
        };
        resolve(fileAttributes);
    });
}

function getFileDateDict(file) {
    return new Promise((resolve, reject) => {
        let modDate = file.mtime;
        modDate = modDate.toISOString();
        modDate = modDate.split("-");
        const modDateDict = {
            modYear: modDate[0],
            modMon: modDate[1],
        };
        resolve(modDateDict);
    });
}

async function organizeFile(filePath, targetDir) {
    try {
        const file = await fs.promises.stat(filePath);
        const randName = await randomString();
        const newFileAttributes = await getNewFileAttributes(
            filePath,
            randName
        );
        await fs.promises.rename(filePath, newFileAttributes.path);
        const fileDateDict = await getFileDateDict(file);
        const targetYearPath = targetDir + "/" + fileDateDict.modYear;
        const targetMonthPath =
            targetYearPath +
            "/" +
            fileDateDict.modYear +
            "-" +
            fileDateDict.modMon;

        try {
            if (fs.existsSync(targetYearPath)) {
                if (fs.existsSync(targetMonthPath)) {
                } else {
                    await fs.promises.mkdir(targetMonthPath);
                }
            } else {
                await fs.promises.mkdir(targetYearPath);
                await fs.promises.mkdir(targetMonthPath);
            }
        } catch (err) {
            console.log(`${targetMonthPath} already exists, moving file`);
        } finally {
            await fs.promises.rename(
                newFileAttributes.path,
                targetMonthPath + "/" + newFileAttributes.name
            );
        }
    } catch (err) {
        console.log(err);
    }
}
