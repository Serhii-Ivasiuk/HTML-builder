const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'text.txt');

function readFile(path) {
  const readableStream = fs.createReadStream(path, { encoding: 'utf8' });

  readableStream.on('error', (error) => console.error(error.message));
  readableStream.on('data', (data) => console.log(data));
}

readFile(filePath);
