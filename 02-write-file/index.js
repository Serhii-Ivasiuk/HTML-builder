const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PROMPT_MSG = 'Enter your message to the world: ';
const EXIT_MSG = 'exit';
const FINISH_MSG = 'All your messages saved into the file: ';

const filePath = path.join(__dirname, 'text.txt');

function writePromptsIntoFile(path) {
  const writableStream = fs.createWriteStream(path);

  writableStream.on('error', (error) => console.error(error.message));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT_MSG,
  });

  rl.prompt();

  rl.on('line', (text) => {
    const normalizedText = text.trim().toLocaleLowerCase();

    if (normalizedText === EXIT_MSG) {
      return rl.close();
    } else {
      writableStream.write(`${text}\n`);
      return rl.prompt();
    }
  });

  rl.on('close', () => {
    writableStream.end();
    writableStream.on('finish', () => console.log(`${FINISH_MSG}${path}`));
    setTimeout(() => process.exit(0), 0);
  });
}

writePromptsIntoFile(filePath);
