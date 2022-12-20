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
        reject(
            console.error(
                `Error in function getFileAttributes with path ${path}: ${err}`
            )
        ); // returns an error if the attributes of "path" cannot be obtained
    }
}

function isDir(path) {
    try {
        return fs.statSync(path).isDirectory(); // returns true if file is a directory, false if it is a file
    } catch (err) {
        return false; // returns false for invalid directories
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
            `Error in function setRandomFileName with file ${fileAttributes.path}: ${err}`
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
        console.error(
            `Error in function organizeFile with path ${filePath} and target ${targetDir}: ${err}`
        ); // logs an error if the file was not able to be moved
    }
}

function unorganizedFileFinder(sourceDir, targetDir) {
    try {
        console.log(`Moving files in ${sourceDir}`);
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
            `Error in function unorganizedFileFinder with source ${sourceDir} and target ${targetDir}: ${err}`
        ); // logs an error if the contents in "sourceDir" were unable to be moved into "targetDir"
    }
}

function isValidName(fileAttributes) {
    try {
        const regex = /\d{4}-\d{2}_\d*/; // basic regex to find patterns of the form YYYY-MM_xxxx
        if (fileAttributes.name.match(regex)) {
            return true; // all names that match the above regex return true
        } else {
            return false; // all names that do not match the above regex return false
        }
    } catch (err) {
        console.error(
            `Error in function isValidName with file ${fileAttributes}: ${err}`
        ); // logs an error if it was not able to determine if a given file had a valid name
    }
}

function getLargestOrganizedFileNumber(fileAttributes, largestFileNumber) {
    try {
        const fileNumber = fileAttributes.name.split("_")[1]; // obtains the file number from the file name
        if (Number(fileNumber) >= Number(largestFileNumber)) {
            return fileNumber; // returns the file number if it is larger than the current largest file number
        } else {
            return largestFileNumber; // returns the largest file number if the current number is smaller than the largest file number
        }
    } catch (err) {
        console.error(
            `Error in function getLargestOrganizedFileNumber with current file ${fileAttributes} and initial largest file number ${largestFileNumber}: ${err}`
        ); // logs an error if the largest file number cannot be obtained
    }
}

function renameFileQueue(queue, num) {
    try {
        num = Number(num); // converts object to number primitive, this corresponds to the largest number found in "getLargestOrganizedFileNumber"
        while (queue.length) {
            num += 1; // increase the number to avoid naming conflicts
            let file = queue.shift(); //pull fileAttributes object out of the queue
            let newName =
                file.parentDir +
                "/" +
                file.modYear +
                "-" +
                file.modMon +
                "_" +
                num +
                file.extension; // new absolute file path
            fs.renameSync(file.path, newName);
        }
    } catch (err) {
        console.err(
            `Error in function renameFileQueue with queue ${queue} and largest file number ${num}: ${err}`
        );
    }
}

function verifyOrganizedDirectoryNames(files, month) {
    try {
        console.log(`Verifying file names in ${month}`);
        var renameQueue = []; // empty queue of fileAttribute objects to be renamed
        var largestOrganizedFileNumber = -1; // -1 corresponds to 0 organized files in "month" absolute path
        for (let k in files) {
            const file = `${month}/${files[k]}`; // absolute path to a file in "targetDir/year/month"
            let fileAttributes = getFileAttributes(file);
            if (isValidName(fileAttributes)) {
                largestOrganizedFileNumber = getLargestOrganizedFileNumber(
                    fileAttributes,
                    largestOrganizedFileNumber
                ); // finds the file with the largest number (xxxx) in file name of the form YYYY-MM_xxxx.ext
            } else {
                renameQueue.push(fileAttributes); // if file name is not valid, add to rename queue
            }
        }
        renameFileQueue(renameQueue, largestOrganizedFileNumber); // organize queue of improperly named files
    } catch (err) {
        console.log(
            `Error in function verifyOrganizedDirectoryNames with files ${files} and month ${month}: ${err}`
        );
    }
}

function organizedDirectoryNavigator(targetDir) {
    try {
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
        console.error(
            `Error in function organizedDirectoryNavigator with target ${targetDir}: ${err}`
        );
    }
}

function driver() {
    let sPath = ""; // Absolute path to main source directory
    let tPath = ""; // absolute path to main target directory
    unorganizedFileFinder(sPath, tPath); // finds all unorganized files in "sPath" and moves them to "tPath" with randomized names to avoid file conflicts
    organizedDirectoryNavigator(tPath); // navigates organized file tree looking for and renaming all files that do not match the form of "YYYY-MM_xxxx.ext"
}

driver(); // calls driver function
