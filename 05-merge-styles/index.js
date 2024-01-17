const fs = require('fs/promises');
const path = require('path');

const TARGET_FILE_EXT = '.css';
const BUILD_FILE_NAME = 'bundle.css';
const srcFolderPath = path.join(__dirname, 'styles');
const distFolderPath = path.join(__dirname, 'project-dist');
const SUCCESS_MESSAGE = 'Build successfully completed!';
const ERROR_MESSAGE = 'Build error!';

async function getFilePaths(pathToFolder) {
  try {
    const files = await fs.readdir(pathToFolder, { withFileTypes: true });
    const filePaths = [];

    files.forEach((file) => {
      const isDir = file.isDirectory();
      if (isDir) return;

      const fileExt = path.extname(file.name);
      if (fileExt !== TARGET_FILE_EXT) return;

      const filePath = path.join(pathToFolder, file.name);
      filePaths.push(filePath);
    });

    return filePaths;
  } catch (error) {
    throw error;
  }
}

async function readFile(path) {
  try {
    const fileContent = await fs.readFile(path, { encoding: 'utf8' });
    return `${fileContent}\n`;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function build(scrFolder, distFolder, buildFileName) {
  try {
    const filePaths = await getFilePaths(scrFolder);
    const fileContent = filePaths.map(async (path) => await readFile(path));
    const distFilePath = path.join(distFolder, buildFileName);
    await fs.writeFile(distFilePath, fileContent, 'utf8');
    console.log(SUCCESS_MESSAGE);
  } catch (error) {
    console.log(ERROR_MESSAGE);
    console.error(error);
  }
}

build(srcFolderPath, distFolderPath, BUILD_FILE_NAME);
