const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles || [];
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const publicFiles = getAllFiles('public');
const appFiles = getAllFiles('app');

const allAppContent = appFiles.filter(f => f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx'))
  .map(f => fs.readFileSync(f, 'utf8')).join('\n');

const unused = publicFiles.filter(f => {
  // Normalize path to match how it's likely used in code (e.g. /banners/hero.png)
  const relativePath = f.replace('public' + path.sep, '').replace(/\\/g, '/');
  const searchStr = '/' + relativePath;
  
  // Also check without the leading slash just in case
  return !allAppContent.includes(searchStr) && !allAppContent.includes('"' + relativePath + '"') && !allAppContent.includes("'" + relativePath + "'");
});

console.log(JSON.stringify(unused, null, 2));
