const fs = require('fs/promises');
const path = require('path');

const folderName = 'files';
const srcDirPath = path.join(__dirname, folderName);
const destDirPath = path.join(__dirname, `${folderName}-copy`);
const SUCCESS_MESSAGE = `All files from folder "${srcDirPath}" has been copied to the the folder "${destDirPath}"`;

async function copyDir(fromPath, toPath) {
  try {
    // reading files to copy
    const srcFiles = await fs.readdir(fromPath);

    // creating a destination folder
    await fs.mkdir(toPath, { recursive: true }, (err) => {
      if (err) return console.error(err.message);
    });

    // copying files
    for (const file of srcFiles) {
      const fromFilePath = path.join(fromPath, file);
      const toFilePath = path.join(toPath, file);
      await fs.copyFile(fromFilePath, toFilePath);
    }

    console.log(SUCCESS_MESSAGE);

    // removing files, that are not exist in source folder
    const destFiles = await fs.readdir(toPath);
    const filesToRemove = destFiles.filter((file) => !srcFiles.includes(file));

    for (const file of filesToRemove) {
      const removeFilePath = path.join(toPath, file);
      await fs.unlink(removeFilePath);
    }
  } catch (error) {
    console.log(error.message);
    // removing destination folder if error
    await fs.rm(toPath, { recursive: true }, (err) => {
      if (err) return console.error(err.message);
    });
  }
}

copyDir(srcDirPath, destDirPath);
