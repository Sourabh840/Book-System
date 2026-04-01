const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'app', 'api', 'books', '[bookId]');
const dest = path.join(__dirname, 'app', 'books', '[bookId]');

if (fs.existsSync(src)) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
  console.log('Successfully moved', src, 'to', dest);
} else {
  console.log('Source does not exist:', src);
}
