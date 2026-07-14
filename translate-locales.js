import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, 'src', 'locales');
const enFilePath = path.join(localesDir, 'en.json');

// Read base English file
const enData = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));

// Get all json files in locales except en.json and id.json
let files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json' && f !== 'id.json');

// Sort files to ensure alphabetical order
files = files.sort();

// Find the index of he.json and slice the array to start from there
const startIndex = files.indexOf('my.json');
if (startIndex !== -1) {
  files = files.slice(startIndex);
}

console.log(`Found ${files.length} languages to translate starting from he.json.`);

// Function to translate text using free Google Translate API
async function translateText(text, targetLang, retries = 3) {
  await new Promise(r => setTimeout(r, 300)); // 300ms delay to respect rate limits
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  
  try {
    const response = await fetch(url);
    if (response.status === 429) {
      if (retries > 0) {
        console.warn(`Rate limit hit for ${targetLang}. Retrying in 5 seconds...`);
        await new Promise(r => setTimeout(r, 5000));
        return translateText(text, targetLang, retries - 1);
      }
      throw new Error('Too Many Requests');
    }
    const result = await response.json();
    return result[0][0][0];
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error.message);
    return text; // Fallback to english if error
  }
}

// Recursively translate JSON object
async function translateObject(obj, targetLang) {
  const newObj = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      newObj[key] = await translateText(obj[key], targetLang);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[key] = await translateObject(obj[key], targetLang);
    } else {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

async function runTranslation() {
  for (const file of files) {
    const langCode = file.replace('.json', '');
    console.log(`Translating to ${langCode}...`);
    
    try {
      const translatedData = await translateObject(enData, langCode);
      fs.writeFileSync(path.join(localesDir, file), JSON.stringify(translatedData, null, 2));
      console.log(`Successfully translated ${file}`);
    } catch (error) {
      console.error(`Failed to translate ${file}:`, error);
    }
  }
  console.log('All translations completed!');
}

runTranslation();
