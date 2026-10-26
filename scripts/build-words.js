const fs = require('fs');
const path = require('path');

function normalize(w) {
  return w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

const wordsMap = new Map(); // word -> source

// 1. ENABLE English words (8938 words)
const enablePath = path.join(__dirname, 'enable-words.txt');
if (fs.existsSync(enablePath)) {
  const lines = fs.readFileSync(enablePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const w = normalize(line);
    if (w.length === 5 && /^[a-z]+$/.test(w)) {
      wordsMap.set(w, 'english');
    }
  }
}

// 2. Naija words
const naijaPath = path.join(__dirname, '..', 'src', 'data', 'naija-words.txt');
if (fs.existsSync(naijaPath)) {
  const lines = fs.readFileSync(naijaPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const w = normalize(line);
    if (w.length === 5 && /^[a-z]+$/.test(w)) {
      wordsMap.set(w, 'naija');
    }
  }
}

// 3. Answers
const answersPath = path.join(__dirname, '..', 'src', 'data', 'answers.json');
if (fs.existsSync(answersPath)) {
  const answers = JSON.parse(fs.readFileSync(answersPath, 'utf8'));
  for (const a of answers) {
    const w = normalize(a);
    if (w.length === 5 && /^[a-z]+$/.test(w)) {
      wordsMap.set(w, 'answer');
    }
  }
}

console.log('Total unique 5-letter words compiled:', wordsMap.size);

const sortedWords = Array.from(wordsMap.keys()).sort();
const outPath = path.join(__dirname, '..', 'src', 'data', 'valid-guesses.json');
fs.writeFileSync(outPath, JSON.stringify(sortedWords));
console.log('Saved src/data/valid-guesses.json with', sortedWords.length, 'words');

// Generate SQL migration chunks
const sqlInserts = [];
for (const [w, src] of wordsMap.entries()) {
  sqlInserts.push(`('${w}', '${src}')`);
}

const chunks = [];
for (let i = 0; i < sqlInserts.length; i += 1000) {
  const chunk = sqlInserts.slice(i, i + 1000);
  chunks.push(
    `insert into public.words (word, source) values\n  ${chunk.join(',\n  ')}\non conflict (word) do update set source = excluded.source;`
  );
}

const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '20261025000001_seed_words.sql');
fs.writeFileSync(migrationFile, '-- Seed dictionary words\n\n' + chunks.join('\n\n') + '\n');
console.log('Created migration:', migrationFile, 'with', chunks.length, 'statements');

