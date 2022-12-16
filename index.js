import fs from "fs";

function getFileAttributes(path) {
    return new Promise((resolve, reject) => {
        try {
            const file = fs.statSync(path); //returns information about the file located at "path"
            const modDate = file.mtime.toISOString().split("-"); // returns an array with both the year and month of last modification
            const pathArray = path.split("/"); // array whose elements consist of subdirectories leading to the path of the file
            const fullFileNameArr = pathArray.pop(1).split("."); // an array that contains the file name and extension in the form of ["name" "extension"]
            const name = fullFileNameArr[0]; // the name of the file
            const extension = "." + fullFileNameArr[1]; // the file extension including the "." character
            const parentDir = pathArray.join("/"); // the parent directory to the file
            const fileAttributes = {
                path: path,
                parentDir: parentDir,
                name: name,
                extension: extension,
                modYear: modDate[0],
                modMon: modDate[1],
            }; // object containing all relevant file information
            resolve(fileAttributes);
        } catch (err) {
            reject(console.error(`Unable to obtain attributes of ${path}`)); // returns an error if the attributes of "path" cannot be obtained
        }
    });
}

function isDir(path) {
    try {
        return fs.statSync(path).isDirectory(); // returns true if file is a directory, false if it is a file
    } catch (err) {
        return false; // returns false for invalid files
    }
}

function isFile(path) {
    try {
        return fs.statSync(path).isFile(); // returns true if file is a file, false if it is a directory
    } catch (err) {
        return false; // returns false for invalid files
    }
}

function setRandomFileName(fileAttributes) {
    return new Promise((resolve, reject) => {
        try {
            const randomName = Math.random().toString(36).slice(2); // a random file name to be used while moving files to avoid path conflicts
            fs.renameSync(
                fileAttributes.path,
                fileAttributes.parentDir +
                    "/" +
                    randomName +
                    fileAttributes.extension
            ); // rename the file using the randomly generated name
            fileAttributes.name = randomName; // update fileAttributes object to contain updated name
            fileAttributes.path =
                fileAttributes.parentDir +
                "/" +
                randomName +
                fileAttributes.extension; // update fileAttributes object to contain updated path
            resolve(fileAttributes);
        } catch (err) {
            reject(
                console.error(
                    `Unable to randomize name of file ${fileAttributes.path}`
                ) // returns if the file represented by fileAttributes cannot be renamed
            );
        }
    });
}

async function organizeFile(filePath, targetDir) {
    try {
        let fileAttributes = await getFileAttributes(filePath); // returns an object containing relevant file information
        fileAttributes = await setRandomFileName(fileAttributes); // randomizes the file name to avoid path conflicts and updates fileAttributes object
        const targetYearPath = targetDir + "/" + fileAttributes.modYear; // the path corresponding to the directory in "targetDir" corresponding to the year the file was last modified
        const targetMonthPath =
            targetYearPath +
            "/" +
            fileAttributes.modYear +
            "-" +
            fileAttributes.modMon; // the path corresponding to the directory in "targetDir" corresponding to the year and month the file was last modified

        if (fs.existsSync(targetYearPath)) {
            if (fs.existsSync(targetMonthPath)) {
            } else {
                fs.mkdirSync(targetMonthPath); // creates the month directory if "targetYearPath" exists in "targetDir"
            }
        } else {
            fs.mkdirSync(targetYearPath); // creates the year directory if neither "targetYearPath" or "targetMonthPath" exists in "targetDir"
            fs.mkdirSync(targetMonthPath); // creates the month directory if neither "targetYearPath" or "targetMonthPath" exists in "targetDir"
        }
        await fs.promises.rename(
            fileAttributes.path,
            targetMonthPath +
                "/" +
                fileAttributes.name +
                fileAttributes.extension
        ); // moves the file to the corresponding "targetYearPath" and "targetMonthPath" in "targetDir"
    } catch (err) {
        console.error(`The file ${filePath} was not able to be organized`); // logs an error if the file was not able to be moved
    }
}

function unorganizedFileFinder(sourceDir, targetDir) {
    let contents = fs.readdirSync(sourceDir); // returns an array containing all contents in "sourceDir"
    for (const i in contents) {
        let item = `${sourceDir}/${contents[i]}`; // absolute path of item in "sourceDir"
        if (isFile(item)) {
            organizeFile(item, targetDir); // if the file is an item then it gets organized
        } else if (isDir(item)) {
            unorganizedFileFinder(item, targetDir); // if the item is a directory then it gets entered
        }
    }
}
