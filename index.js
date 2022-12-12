import fs from "fs";

function randomString() {
    return new Promise((resolve, reject) => {
        resolve(Math.random().toString(36).slice(2));
    });
}

function randomizeFileName(path, randName) {
    return new Promise((resolve, reject) => {
        let pathArray = path.split("/");
        let parentDirectory = pathArray.slice(0, -1).join("/");
        let fileName = pathArray.pop(1);
        let fileExtension = fileName.split(".").pop(1);
        let newPath = parentDirectory + "/" + randName + "." + fileExtension;
        resolve(newPath);
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
        const newFilePath = await randomizeFileName(filePath, randName);
        await fs.promises.rename(filePath, newFilePath);
        const fileDateDict = await getFileDateDict(file);
        const targetYearPath = targetDir + "/" + fileDateDict.modYear;
        const targetMonthPath = targetYearPath + "/" + fileDateDict.modMon;
        if (fs.existsSync(targetYearPath)) {
            if (fs.existsSync(targetMonthPath)) {
            } else {
                //make month directory
                // move file
            }
        } else {
            //make year directory
            //make month directory
            // move file
        }
        //rename file
    } catch (err) {
        console.log(err);
    }
    console.log("done");
}

organizeFile(
    "C:/Users/sjwys/Documents/Projects/FileMan/test.txt",
    "C:/Users/sjwys/Documents/Projects/FileMan/target"
);
