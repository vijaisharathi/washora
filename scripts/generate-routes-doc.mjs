import fs from 'fs';
import path from 'path';

function getAppPages(dir, baseDir = dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAppPages(fullPath, baseDir));
    } else if (entry.name === 'page.tsx') {
      const relPath = path.relative(baseDir, dir).replace(/\\/g, '/');
      const routeUrl = '/' + (relPath === '' ? '' : relPath);
      results.push({
        filePath: 'src/app/' + (relPath === '' ? 'page.tsx' : relPath + '/page.tsx'),
        routeUrl: routeUrl === '/' ? '/' : routeUrl.replace(/\/page$/, '')
      });
    }
  }
  return results;
}

const allPages = getAppPages('src/app');
console.log(`Found ${allPages.length} total routes`);
fs.writeFileSync('temp_routes.json', JSON.stringify(allPages, null, 2));
