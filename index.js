import fs from "fs";

function getFileAttributes(path) {
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
        return fileAttributes;
    } catch (err) {
        reject(console.error(`Unable to obtain attributes of ${path}`)); // returns an error if the attributes of "path" cannot be obtained
    }
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
        return fileAttributes;
    } catch (err) {
        console.error(
            `Unable to randomize name of file ${fileAttributes.path}`
        ); // returns if the file represented by fileAttributes cannot be renamed
    }
}

function organizeFile(filePath, targetDir) {
    try {
        let fileAttributes = getFileAttributes(filePath); // returns an object containing relevant file information
        fileAttributes = setRandomFileName(fileAttributes); // randomizes the file name to avoid path conflicts and updates fileAttributes object
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
        fs.renameSync(
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
    try {
        console.log("Moving Files");
        const contents = fs.readdirSync(sourceDir); // returns an array containing all contents in "sourceDir"
        for (let i in contents) {
            const item = `${sourceDir}/${contents[i]}`; // absolute path of item in "sourceDir"
            if (isFile(item)) {
                organizeFile(item, targetDir); // if the file is an item then it gets organized
            } else if (isDir(item)) {
                unorganizedFileFinder(item, targetDir); // if the item is a directory then it gets entered
            }
        }
    } catch (err) {
        console.error(
            `Unable to organize contents of ${sourceDir} into ${targetDir}`
        ); // logs an error if the contents in "sourceDir" were unable to be moved into "targetDir"
    }
}

function isValidName(fileAttributes) {
    try {
        const regex = /\d{4}-\d{2}_\d*/; // basic regex to find patterns of the form YYYY-MM_X...
        if (fileAttributes.name.match(regex)) {
            return true; // all names that match the above regex return true
        } else {
            return false; // all names that do not match the above regex return false
        }
    } catch (err) {
        console.error(
            `Unable to determine if ${fileAttributes.name} at ${fileAttributes.path} is a valid file name`
        ); // logs an error if it was not able to determine if a given file had a valid name
    }
}

function getLargestOrganizedFileNumber(fileAttributes, largestFileNumber) {
    try {
        const fileNumber = fileAttributes.name.split("_")[1];
        if (Number(fileNumber) >= Number(largestFileNumber)) {
            return fileNumber;
        } else {
            return largestFileNumber;
        }
    } catch (err) {
        console.error(
            `Unable to obtain the largest organized file number using largestFileNumber = ${largestFileNumber} and current file = ${fileAttributes}`
        );
    }
}

function renameFileQueue(queue, num) {
    try {
        num = Number(num);
        while (queue.length) {
            num += 1;
            let file = queue.shift();
            let newName =
                file.parentDir +
                "/" +
                file.modYear +
                "-" +
                file.modMon +
                "_" +
                num +
                file.extension;
            fs.renameSync(file.path, newName);
        }
    } catch (err) {
        console.err(err);
    }
}

function verifyOrganizedDirectoryNames(files, month) {
    var renameQueue = [];
    var largestOrganizedFileNumber = -1;
    for (let k in files) {
        const file = `${month}/${files[k]}`; // absolute path to a file in "targetDir/year/month"
        let fileAttributes = getFileAttributes(file);
        if (isValidName(fileAttributes)) {
            largestOrganizedFileNumber = getLargestOrganizedFileNumber(
                fileAttributes,
                largestOrganizedFileNumber
            );
        } else {
            renameQueue.push(fileAttributes);
        }
    }
    renameFileQueue(renameQueue, largestOrganizedFileNumber);
}

function organizedDirectoryNavigator(targetDir) {
    try {
        console.log("Validating File Names");
        const years = fs.readdirSync(targetDir); // returns an array containing all year directories in "targetDir"
        for (let i in years) {
            const year = `${targetDir}/${years[i]}`; // absolute path to a year directory in "targetDir"
            const months = fs.readdirSync(year);
            for (let j in months) {
                const month = `${year}/${months[j]}`; // absolute path to a month directory in "targetDir/year"
                const files = fs.readdirSync(month);
                verifyOrganizedDirectoryNames(files, month);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

function driver() {
    let sPath = "C:/Users/sjwys/Desktop/source - Copy";
    let tPath = "C:/Users/sjwys/Desktop/target";
    unorganizedFileFinder(sPath, tPath);
    organizedDirectoryNavigator(tPath);
}

driver();
