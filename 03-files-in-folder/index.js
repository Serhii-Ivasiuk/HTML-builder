const fs = require('fs/promises');
const path = require('path');

const BYTES_IN_KB = 1024;
const folderPath = path.join(__dirname, 'secret-folder');

async function printFilesInfoFromFolder(pathToFolder) {
  try {
    const files = await fs.readdir(pathToFolder, { withFileTypes: true });

    for (const file of files) {
      const isDir = file.isDirectory();
      if (isDir) continue;

      const fileName = file.name.split('.')[0];
      const fileExt = path.extname(file.name).replace('.', '');
      const filePath = path.join(folderPath, file.name);
      const fileStats = await fs.stat(filePath);
      const fileSize = (fileStats.size / BYTES_IN_KB).toFixed(2);

      console.log(`${fileName} - ${fileExt} - ${fileSize}kb`);
    }
  } catch (err) {
    console.error(err.message);
  }
}

printFilesInfoFromFolder(folderPath);
