const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getFiles(dir, files_) {
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = path.join(dir, files[i]);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.jsx')) {
      files_.push(name);
    }
  }
  return files_;
}

const allFiles = getFiles(srcDir);

allFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Regex to match <Stack ...> tag
  content = content.replace(/<Stack([\s\S]*?)>/g, (match, stackProps) => {
    const sxProps = [];
    let updatedProps = stackProps;

    const propsToExtract = ['alignItems', 'justifyContent', 'gap', 'flexWrap'];
    let hasExtracted = false;

    propsToExtract.forEach(prop => {
      const regex = new RegExp(`\\b${prop}=(\\{[\\s\\S]*?\\}|"[^"]*"|'[^']*')`, 'g');
      let m;
      while ((m = regex.exec(stackProps)) !== null) {
        let val = m[1].trim();
        if (val.startsWith('{') && val.endsWith('}')) {
          val = val.substring(1, val.length - 1).trim();
        }
        sxProps.push(`${prop}: ${val}`);
        hasExtracted = true;
      }
      updatedProps = updatedProps.replace(regex, '');
    });

    if (!hasExtracted) {
      return match;
    }

    const sxRegex = /sx=\{\{\s*([\s\S]*?)\s*\}\}/;
    const sxMatch = sxRegex.exec(updatedProps);

    if (sxMatch) {
      const existingSx = sxMatch[1].trim();
      const delimiter = existingSx && !existingSx.endsWith(',') ? ', ' : ' ';
      const newSx = `sx={{ ${existingSx}${delimiter}${sxProps.join(', ')} }}`;
      updatedProps = updatedProps.replace(sxRegex, newSx);
    } else {
      updatedProps = updatedProps.trim() + ` sx={{ ${sxProps.join(', ')} }}`;
    }

    updatedProps = updatedProps.replace(/\s+/g, ' ');

    modified = true;
    return `<Stack ${updatedProps.trim()}>`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated Stack properties in: ${path.basename(filePath)}`);
  }
});
