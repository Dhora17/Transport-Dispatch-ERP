const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to match <Grid size={{ ... }}
  content = content.replace(/<Grid\s+size=\{\{\s*(.*?)\s*\}\}/g, (match, sizeProps) => {
    // Split key-value pairs by comma, ignoring commas inside ternary expressions
    const pairs = sizeProps.split(/,\s*(?![^?]*\?)/);
    const attributes = pairs.map(pair => {
      const colonIndex = pair.indexOf(':');
      if (colonIndex === -1) return '';
      const key = pair.substring(0, colonIndex).trim();
      const val = pair.substring(colonIndex + 1).trim();
      return `${key}={${val}}`;
    }).filter(Boolean).join(' ');
    
    return `<Grid item ${attributes}`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully converted Grid size props in: ${file}`);
}
