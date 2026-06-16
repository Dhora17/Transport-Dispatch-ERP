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
    // Parse key-value attributes from the Stack props
    // We want to capture props like:
    // alignItems="..." or alignItems={{...}}
    // justifyContent="..." or justifyContent={{...}}
    // gap="..." or gap={...}
    // flexWrap="..."
    
    // We will build a list of properties to move to sx
    const sxProps = [];
    let updatedProps = stackProps;

    const propsToExtract = ['alignItems', 'justifyContent', 'gap', 'flexWrap'];
    let hasExtracted = false;

    propsToExtract.forEach(prop => {
      // Regex to match: prop="value" or prop={value} or prop={{value}}
      const regex = new RegExp(`\\b${prop}=(\\{[\\s\\S]*?\\}|"[^"]*"|'[^']*')`, 'g');
      let m;
      while ((m = regex.exec(stackProps)) !== null) {
        let val = m[1].trim();
        // Remove surrounding quotes or braces if necessary, or keep them
        if (val.startsWith('{') && val.endsWith('}')) {
          val = val.substring(1, val.length - 1).trim();
        }
        sxProps.push(`${prop}: ${val}`);
        hasExtracted = true;
      }
      // Remove it from the main props list
      updatedProps = updatedProps.replace(regex, '');
    });

    if (!hasExtracted) {
      return match;
    }

    // Now check if an sx prop already exists in updatedProps
    const sxRegex = /sx=\{\{\s*([\s\S]*?)\s*\}\}/;
    const sxMatch = sxRegex.exec(updatedProps);

    if (sxMatch) {
      // Merge into existing sx
      const existingSx = sxMatch[1].trim();
      const delimiter = existingSx && !existingSx.endsWith(',') ? ', ' : ' ';
      const newSx = `sx={{ ${existingSx}${delimiter}${sxProps.join(', ')} }}`;
      updatedProps = updatedProps.replace(sxRegex, newSx);
    } else {
      // Add new sx prop
      updatedProps = updatedProps.trim() + ` sx={{ ${sxProps.join(', ')} }}`;
    }

    // Clean up double spaces
    updatedProps = updatedProps.replace(/\s+/g, ' ');

    modified = true;
    return `<Stack ${updatedProps.trim()}>`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated Stack properties in: ${path.basename(filePath)}`);
  }
});
