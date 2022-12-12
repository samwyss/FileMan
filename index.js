import fs from "fs";

//TODO: Clean up and optimize code
//TODO: Figure out why some files do not get moved, too many asynch moves at once?
//TODO: Write renaming function that goes into target directory and renames any file not of the form YYYY-MM-XX

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

function isDir(path) {
    return fs.statSync(path).isDirectory();
}

function isFile(path) {
    return fs.statSync(path).isFile();
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
            console.log(`Attempted to create existing directory, moving file`);
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

function unorganizedDirNavigator(sourceDir, targetDir) {
    let contents = fs.readdirSync(sourceDir);

    for (const i in contents) {
        let item = `${sourceDir}/${contents[i]}`;
        if (isFile(item)) {
            organizeFile(item, targetDir);
        } else if (isDir(item)) {
            unorganizedDirNavigator(item, targetDir);
        }
    }
}
