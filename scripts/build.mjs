import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Content-based filenames prevent browsers and CDNs from reusing an older design.
await rm('_site', { recursive: true, force: true });
await mkdir('_site', { recursive: true });
let html = await readFile('index.html', 'utf8');
for (const file of ['app.js', 'style.css', 'favicon.svg']) {
  const content = await readFile(file);
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
  const versioned = file.replace(/(\.[^.]+)$/, `.${hash}$1`);
  await writeFile(`_site/${versioned}`, content);
  html = html.replaceAll(`"${file}"`, `"${versioned}"`);
}
await writeFile('_site/index.html', html);
await writeFile('_site/.nojekyll', '');
console.log('Built versioned static site in _site/');
