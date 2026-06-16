const fs = require('fs');
const path = require('path');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\Dhora\\.gemini\\antigravity\\brain\\5ee47c86-537c-422f-83e6-a4e12f46c74f\\.system_generated\\logs\\transcript_full.jsonl';

const targetFiles = [
  'Customers.tsx',
  'Dashboard.tsx',
  'DispatchList.tsx',
  'Reports.tsx',
  'Settings.tsx',
  'Transporters.tsx'
];

const fileVersions = {};

async function restore() {
  const fileStream = fs.createReadStream(transcriptPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const step = JSON.parse(line);
      if (step.tool_calls) {
        step.tool_calls.forEach(tc => {
          if (tc.name === 'write_to_file' && tc.args) {
            const target = tc.args.TargetFile;
            if (target) {
              const matched = targetFiles.find(tf => target.includes(tf));
              if (matched && tc.args.CodeContent) {
                // Keep the latest version in the transcript
                fileVersions[matched] = {
                  path: target.replace(/^"|"$/g, '').replace(/\\\\/g, '\\'),
                  content: tc.args.CodeContent.replace(/^"|"$/g, '')
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '\r')
                    .replace(/\\t/g, '\t')
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\')
                };
              }
            }
          }
        });
      }
    } catch (e) {
      // Ignore JSON parse error on single line
    }
  }

  // Write recovered files back to their paths
  for (const filename of targetFiles) {
    const fileInfo = fileVersions[filename];
    if (fileInfo) {
      fs.writeFileSync(fileInfo.path, fileInfo.content, 'utf8');
      console.log(`Successfully restored: ${filename} to ${fileInfo.path}`);
    } else {
      console.log(`No version found in transcript for: ${filename}`);
    }
  }
}

restore();
