const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const compDir = path.join(__dirname, 'src', 'components');

const dirs = [pagesDir, compDir];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'));

  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Convert InputProps={{ ... }} to slotProps={{ input: { ... } }}
    content = content.replace(/InputProps=\{\{\s*([\s\S]*?)\s*\}\}/g, 'slotProps={{ input: { $1 } }}');

    // 2. Convert InputLabelProps={{ ... }} to slotProps={{ inputLabel: { ... } }}
    content = content.replace(/InputLabelProps=\{\{\s*([\s\S]*?)\s*\}\}/g, 'slotProps={{ inputLabel: { $1 } }}');

    // 3. Convert PaperProps={{ ... }} to slotProps={{ paper: { ... } }}
    content = content.replace(/PaperProps=\{\{\s*([\s\S]*?)\s*\}\}/g, 'slotProps={{ paper: { $1 } }}');

    // 4. Fix primaryTypographyProps={{ fontSize: 14, fontWeight: ... }}
    content = content.replace(/primaryTypographyProps=\{\{\s*fontSize:\s*(\d+),\s*fontWeight:\s*([\s\S]*?)\s*\}\}/g, 'primaryTypographyProps={{ sx: { fontSize: $1, fontWeight: $2 } }}');

    // 5. Fix Stack direct layout props (flexWrap, justify-content, justifyContent, alignItems)
    // We will do specific replacements to avoid breaking other attributes
    content = content.replace(/<Stack\s+direction="row"\s+spacing=\{1.5\}\s+sx=\{\{\s*mt:\s*2,\s*px:\s*1\s*\}\}\s+flexWrap="wrap"\s+justifyContent="center"/g, 
      '<Stack direction="row" spacing={1.5} sx={{ mt: 2, px: 1, flexWrap: \'wrap\', justifyContent: \'center\' }}');

    content = content.replace(/justify-content="center"/g, 'sx={{ justifyContent: \'center\' }}');
    content = content.replace(/justify-content="space-between"/g, 'sx={{ justifyContent: \'space-between\' }}');
    
    // Fix Grid container alignments
    content = content.replace(/<Grid\s+container\s+justifyContent="center"/g, '<Grid container sx={{ justifyContent: \'center\' }}');

    // 6. Fix DispatchList.tsx specific Stack flexWrap issue
    content = content.replace(/<Stack\s+direction="row"\s+spacing=\{1.5\}\s+flexWrap="wrap">/g, '<Stack direction="row" spacing={1.5} sx={{ flexWrap: \'wrap\' }}>');
    
    // Fix DispatchList.tsx Stack direction row with direct justify-content
    content = content.replace(/<Stack\s+direction=\{\{\s*xs:\s*'column',\s*sm:\s*'row'\s*\}\}\s+justify-content="space-between"\s+alignItems=\{\{\s*xs:\s*'flex-start',\s*sm:\s*'center'\s*\}\}\s+spacing=\{2\}\s+sx=\{\{\s*mb:\s*4\s*\}\}/g,
      '<Stack direction={{ xs: \'column\', sm: \'row\' }} spacing={2} sx={{ mb: 4, justifyContent: \'space-between\', alignItems: { xs: \'flex-start\', sm: \'center\' } }}');

    content = content.replace(/<Stack\s+direction=\{\{\s*xs:\s*'column',\s*md:\s*'row'\s*\}\}\s+spacing=\{2\}\s+alignItems="center">/g,
      '<Stack direction={{ xs: \'column\', md: \'row\' }} spacing={2} sx={{ alignItems: \'center\' }}>');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated MUI v6 slotProps and layouts in: ${file}`);
  }
}
