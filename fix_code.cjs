const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Revert Grid item back to Grid size
  // Matches: <Grid item attributes...>
  content = content.replace(/<Grid\s+item\s+([^>]*?)>/g, (match, gridProps) => {
    // gridProps will be like: "xs={12} lg={8}" or "xs={4}"
    // We want to extract key={val} pairs
    const sizePairs = [];
    const otherProps = [];
    
    // Regex to extract props
    const propRegex = /(\w+)=\{(.*?)\}/g;
    let m;
    let lastIndex = 0;
    
    while ((m = propRegex.exec(gridProps)) !== null) {
      const propName = m[1];
      const propVal = m[2];
      
      if (['xs', 'sm', 'md', 'lg', 'xl'].includes(propName)) {
        sizePairs.push(`${propName}: ${propVal}`);
      } else {
        otherProps.push(`${propName}={${propVal}}`);
      }
    }
    
    // Reconstruct the Grid element
    const sizeObj = `{ ${sizePairs.join(', ')} }`;
    const otherPropsStr = otherProps.length > 0 ? ' ' + otherProps.join(' ') : '';
    
    return `<Grid size={${sizeObj}}${otherPropsStr}>`;
  });

  // 2. Fix hyphenated keys in sx={{ ... }}
  // Matches: sx={{ ... }}
  content = content.replace(/sx=\{\{\s*(.*?)\s*\}\}/g, (match, sxContent) => {
    // split properties by comma (ignoring commas inside nested objects or arrays if any, though our styles are simple)
    const props = sxContent.split(/,\s*/);
    const fixedProps = props.map(prop => {
      const colonIndex = prop.indexOf(':');
      if (colonIndex === -1) return prop;
      
      let key = prop.substring(0, colonIndex).trim();
      const val = prop.substring(colonIndex + 1).trim();
      
      // If key contains a hyphen and is not quoted
      if (key.includes('-') && !key.startsWith("'") && !key.startsWith('"')) {
        // Convert to camelCase
        key = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      }
      
      return `${key}: ${val}`;
    });
    
    return `sx={{ ${fixedProps.join(', ')} }}`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed formatting and grid sizes in: ${file}`);
}
