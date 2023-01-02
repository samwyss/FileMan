import fs from "fs";

organizeDirectory(,); // driver function

function organizeDirectory(unOrgDir, orgDir) {
    var fileList = []; // an empty list to store the absolute paths of all unorganized files
    var orgDirAttributes = getOrgDirAttributes(orgDir); // retrieves an object containing the number of organized files in each subfolder of the target directory either from disk if present or generates this object if not present
    fileList = getFileList(unOrgDir, fileList); // recursively navigates "unOrgDir" and adds all files to a list as to be reorganized
    for (let i in fileList) {
        let fileAttributes = getFileAttributes(fileList[i]);
        [orgDirAttributes, fileAttributes] = updateOrgDirAttributes(
            orgDirAttributes,
            fileAttributes,
            orgDir
        );
        moveFile(fileAttributes, orgDirAttributes);
    }
    saveJSON(orgDirAttributes, orgDir);
}

function moveFile(fileAttributes, orgDirAttributes) {
    const fileNum = orgDirAttributes[fileAttributes.newParentDir];
    const newPath = `${fileAttributes.newParentDir}/${fileAttributes.modYear}-${fileAttributes.modMon}_${fileNum}${fileAttributes.extension}`;
    fs.renameSync(fileAttributes.path, newPath);
    fileAttributes["path"] = newPath;
}

function saveJSON(obj, path) {
    let objStr = JSON.stringify(obj);
    let name = `${path}/organized-directory-attributes.json`;
    fs.writeFileSync(name, objStr);
}

function getOrgDirAttributes(orgDir) {
    const path = `${orgDir}/organized-directory-attributes.json`;
    if (fs.existsSync(path)) {
        const orgDirAttributesStr = fs.readFileSync(path); // serialized str encoding of "organized-directory-attributes.json"
        var orgDirAttributes = JSON.parse(orgDirAttributesStr);
    } else {
        var orgDirAttributes = buildOrgDirAttributes(orgDir);
    }
    return orgDirAttributes;
}

function buildOrgDirAttributes(orgDir) {
    const orgDirAttributes = {}; // empty object for storing the number of organized files in each directory as a key value pair
    const years = fs.readdirSync(orgDir); // array of year absolute paths in "orgDir"
    for (let i in years) {
        const year = `${orgDir}/${years[i]}`; // specific year absolute path
        const months = fs.readdirSync(year); // all month absolute paths in "orgDir/year"
        for (let j in months) {
            const month = `${year}/${months[j]}`; // specific month absolute path
            const files = fs.readdirSync(month); // all files in "orgDir/year/month"
            orgDirAttributes[`${month}`] = files.length - 1; // set "orgDir/year/month", num key-value pair, -1 is present as these file numbers are zero indexed
        }
    }
    return orgDirAttributes; // return length of files array, all are assumed to be named correctly
}

function getFileList(unOrgDir, fileList) {
    const contents = fs.readdirSync(unOrgDir); // returns an array containing all contents in "sourceDir"
    for (let i in contents) {
        const item = `${unOrgDir}/${contents[i]}`; // absolute path of item in "sourceDir"
        if (isFile(item)) {
            fileList.push(item); // if item is a file, add to list
        } else if (isDir(item)) {
            getFileList(item, fileList); // if item is a directory, enter it and add all files to list
        }
    }
    return fileList; // returns completed file list
}

function isDir(path) {
    if (fs.existsSync(path) && fs.statSync(path).isDirectory()) {
        return true;
    } else {
        return false;
    }
}

function isFile(path) {
    if (fs.existsSync(path) && fs.statSync(path).isFile()) {
        return true;
    } else {
        return false;
    }
}

function getFileAttributes(path) {
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
}

function updateOrgDirAttributes(orgDirAttributes, fileAttributes, orgDir) {
    const yearPath = `${orgDir}/${fileAttributes.modYear}`;
    fileAttributes[
        "newParentDir"
    ] = `${yearPath}/${fileAttributes.modYear}-${fileAttributes.modMon}`;
    if (orgDirAttributes.hasOwnProperty(fileAttributes.newParentDir)) {
        orgDirAttributes[fileAttributes.newParentDir]++; // if the absolute path exists in orgDirAttributes increment it by one
    } else {
        if (!fs.existsSync(yearPath)) {
            mkdirSync(yearPath);
        }
        mkdirSync(fileAttributes.newParentDir); // if targetPath does not exist, create it in orgDir
        orgDirAttributes[fileAttributes.newParentDir] = 0; // if the path does not exist in orgDirAttributes create it using the absolute path as a key setting the value to zero
    }
    return [orgDirAttributes, fileAttributes]; // return updated orgDirAttributes
}
