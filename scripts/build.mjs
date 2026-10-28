import { readFile, mkdir, writeFile, rm, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Content-based filenames prevent browsers and CDNs from reusing an older design.
await rm('_site', { recursive: true, force: true });
await mkdir('_site', { recursive: true });
const versions = new Map();
let html = await readFile('index.html', 'utf8');
for (const name of await readdir('fonts')) {
  await mkdir('_site/fonts', { recursive: true });
  await writeFile(`_site/fonts/${name}`, await readFile(`fonts/${name}`));
}
for (const file of ['data.js', 'app.js', 'style.css', 'favicon.svg']) {
  let content = await readFile(file);
  if (file === 'app.js') content = Buffer.from(content.toString().replaceAll("'./data.js'", `'./${versions.get('data.js')}'`));
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
  const versioned = file.replace(/(\.[^.]+)$/, `.${hash}$1`);
  versions.set(file, versioned);
  await writeFile(`_site/${versioned}`, content);
  html = html.replaceAll(`"${file}"`, `"${versioned}"`);
}
await writeFile('_site/index.html', html);
await writeFile('_site/.nojekyll', '');
console.log('Built versioned static site in _site/');
