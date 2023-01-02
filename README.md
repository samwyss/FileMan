# FileMan

## About

FileMan (File Manager) is a free and open-source personal File Management System Built on node.js. All files in a specified, arbitrarily complex _source_ directory are able to be organized by the last modification date. This code will then move these files into a _target_ specified directory with sub-directories for each year "YYYY" and month **YYYY-MM**. Files in the month directory will all be renamed to match the form **YYYY-MM_xxxx.ext** where **xxxx** corresponds to the index of the file in the **YYYY-MM** directory. The modification date is chosen as to preserve the date nearest to the creation date of the file as the creation date is lost when files are copied.

Please feel free to contribute to this project as you see fit and/or leave feedback. Thank you!

## How to Use

1. Open: **index.js** in your editor of choice
2. At the top of **index.js**, paste the absolute path of your _source_ directory as the first argument in the function call **organizeDirectory**.
3. At the top of **index.js**, paste the absolute path of your _target_ directory as the second argument in the function call **organizeDirectory**.
4. Open your terminal of choice, move to the directory containing _index.js_ and run: _node ._

## Dependencies

1. fs | install using: _npm install fs_

## Future Improvements

-   Desktop friendly app using Electron / React
-   Increased throughput with asynchronous functions using the JS Event Loop
-   Performance enhancements and optimizations
