const fs = require('fs/promises');
const path = require('path');

const SRC_ASSETS_DIR_PATH = path.join(__dirname, 'assets');
const SRC_MARKUP_DIR_PATH = path.join(__dirname, 'components');
const SRC_STYLES_DIR_PATH = path.join(__dirname, 'styles');
const BUILD_DIR_PATH = path.join(__dirname, 'project-dist');
const BUILD_ASSETS_DIR_PATH = path.join(__dirname, 'project-dist', 'assets');
const BUILD_MARKUP_FILE_NAME = 'index.html';
const BUILD_STYLES_FILE_NAME = 'style.css';
const SUCCESS_MESSAGE = 'Build successfully completed!';
const ERROR_MESSAGE = 'Build error!';
const TEMPLATE_FILE_PATH = path.join(__dirname, 'template.html');

async function getFilePaths(pathToFolder, filesExt) {
  try {
    const files = await fs.readdir(pathToFolder, { withFileTypes: true });
    const filePaths = [];

    files.forEach((file) => {
      const isDir = file.isDirectory();
      if (isDir) return;

      const fileExt = path.extname(file.name);
      if (fileExt !== filesExt) return;

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
    const normalizedFileContent = `\n${fileContent.trimEnd()}\n`;
    return normalizedFileContent;
  } catch (error) {
    throw error;
  }
}

async function createFolder(path) {
  try {
    await fs.mkdir(path, { recursive: true }, (err) => {
      if (err) return console.error(err.message);
    });
  } catch (error) {
    throw error;
  }
}

async function removeFolder(path) {
  try {
    await fs.rm(path, { recursive: true });
  } catch (error) {
    throw error;
  }
}

async function copyAssets(fromPath, toPath) {
  try {
    // reading files to copy
    const srcFiles = await fs.readdir(fromPath, { withFileTypes: true });

    // creating a destination folder
    await createFolder(toPath);

    // copying files
    for (const file of srcFiles) {
      const fromFilePath = path.join(fromPath, file.name);
      const toFilePath = path.join(toPath, file.name);
      const isDir = file.isDirectory();

      if (isDir) {
        await copyAssets(fromFilePath, toFilePath);
      } else {
        await fs.copyFile(fromFilePath, toFilePath);
      }
    }

    // removing files or folders, that are not exist in source folder
    const destFiles = await fs.readdir(toPath, { withFileTypes: true });

    for (const destFile of destFiles) {
      const currentItem = srcFiles.find((item) => item.name === destFile.name);
      if (currentItem) continue;

      const removeItemPath = path.join(toPath, destFile.name);

      if (destFile.isDirectory()) {
        await removeFolder(removeItemPath);
      } else {
        await fs.unlink(removeItemPath);
      }
    }
  } catch (error) {
    throw error;
  }
}

async function buildStyles(srcStylesFolderPath, distFolder, buildFileName) {
  try {
    const distFileExt = path.extname(buildFileName);
    const filePaths = await getFilePaths(srcStylesFolderPath, distFileExt);
    const fileContent = await Promise.all(filePaths.map(readFile));
    const distFilePath = path.join(distFolder, buildFileName);
    await fs.writeFile(distFilePath, fileContent, 'utf8');
  } catch (error) {
    throw error;
  }
}

async function buildMarkup(srcMarkupFolderPath, distFolder, buildFileName) {
  try {
    const distFileExt = path.extname(buildFileName);
    const filePaths = await getFilePaths(srcMarkupFolderPath, distFileExt);
    const templateFileContent = await readFile(TEMPLATE_FILE_PATH);
    const fileContent = await Promise.all(
      filePaths.map(async (filePath) => {
        const fileExt = path.extname(filePath);
        const fileName = path.basename(filePath, fileExt);
        const fileContent = await readFile(filePath);
        return {
          name: fileName,
          value: fileContent,
        };
      }),
    );

    let result = templateFileContent;
    fileContent.forEach((item) => {
      result = result.replaceAll(`{{${item.name}}}`, item.value);
    });

    const distFilePath = path.join(distFolder, buildFileName);
    await fs.writeFile(distFilePath, result, 'utf8');
  } catch (error) {
    throw error;
  }
}

async function buildPage(
  scrAssetsFolder,
  srsMarkupFolder,
  scrStylesFolder,
  distFolder,
) {
  try {
    await createFolder(BUILD_DIR_PATH);
    await copyAssets(scrAssetsFolder, BUILD_ASSETS_DIR_PATH);
    await buildMarkup(srsMarkupFolder, distFolder, BUILD_MARKUP_FILE_NAME);
    await buildStyles(scrStylesFolder, distFolder, BUILD_STYLES_FILE_NAME);
    console.log(SUCCESS_MESSAGE);
  } catch (error) {
    console.log(ERROR_MESSAGE);
    console.error(error);
    await removeFolder(BUILD_DIR_PATH);
  }
}

buildPage(
  SRC_ASSETS_DIR_PATH,
  SRC_MARKUP_DIR_PATH,
  SRC_STYLES_DIR_PATH,
  BUILD_DIR_PATH,
);
