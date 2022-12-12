import fs from "fs";

async function organizeFile() {
    try {
        const file = await fs.promises.stat("test.txt");
        console.log(file);
    } catch (err) {
        console.log(err);
    }
    console.log("done");
}

organizeFile();
organizeFile();
organizeFile();
