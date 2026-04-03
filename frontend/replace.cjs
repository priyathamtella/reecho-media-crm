const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) { 
      results.push(file);
    }
  });
  return results;
}
walk('.').forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let updated = content;
  
  if (updated.includes('https://your-go-backend.onrender.com')) {
    updated = updated.replaceAll('https://your-go-backend.onrender.com', 'https://reechomedia.com');
  }
  if (updated.includes('http://localhost:5050')) {
    updated = updated.replaceAll('http://localhost:5050', 'https://reechomedia.com');
  }
  if (updated.includes('http://localhost:5000')) {
    updated = updated.replaceAll('http://localhost:5000', 'https://reechomedia.com');
  }
  if (updated.includes('http://localhost:8080')) {
    updated = updated.replaceAll('http://localhost:8080', 'https://reechomedia.com');
  }

  if (content !== updated) {
    fs.writeFileSync(f, updated, 'utf8');
  }
});
