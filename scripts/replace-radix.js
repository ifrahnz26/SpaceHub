import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, '../client/src/components');

// Map of Radix UI components to our plain components
const componentMap = {
  '@radix-ui/react-dialog': '../plain/Modal',
  '@radix-ui/react-dropdown-menu': '../plain/Dropdown',
  '@radix-ui/react-tabs': '../plain/Tabs',
  '@radix-ui/react-toast': '../plain/Toast',
  '@radix-ui/react-label': '../plain/Label',
  '@radix-ui/react-checkbox': '../plain/Checkbox',
  '@radix-ui/react-select': '../plain/Select',
  '@radix-ui/react-switch': '../plain/Switch',
  '@radix-ui/react-slot': '../plain/Button',
  '@radix-ui/react-avatar': '../plain/Avatar',
};

function replaceImports(content) {
  // Replace Radix UI imports with plain component imports
  Object.entries(componentMap).forEach(([radix, plain]) => {
    const radixRegex = new RegExp(`import.*from ["']${radix}["'];?\n`, 'g');
    content = content.replace(radixRegex, `import { ${plain.split('/').pop()} } from '${plain}';\n`);
  });
  return content;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = replaceImports(content);
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated imports in ${filePath}`);
  }
}
//random
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
      processFile(filePath);
    }
  });
}

// Start processing from components directory
walkDir(componentsDir); 
