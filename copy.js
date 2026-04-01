const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'app', 'api', 'books', '[bookId]');
const destDir = path.join(__dirname, 'app', 'books', '[bookId]');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function rmRecursiveFilesSync(src) {
  const exists = fs.existsSync(src);
  if (!exists) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.readdirSync(src).forEach(function(childItemName) {
      rmRecursiveFilesSync(path.join(src, childItemName));
    });
    try {
      fs.rmdirSync(src); // Might fail if locked, but that's ok as long as files are gone
    } catch(e) {}
  } else {
    try {
      fs.unlinkSync(src);
    } catch(e) {}
  }
}

if (fs.existsSync(srcDir)) {
  console.log('Copying files to app/books/[bookId]...');
  copyRecursiveSync(srcDir, destDir);
  console.log('Removing old files from app/api/... to prevent route conflicts...');
  rmRecursiveFilesSync(srcDir);
  console.log('Done!');
} else {
  console.log('Source does not exist, perhaps already moved?');
}
