const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const content = fs.readFileSync('src/lib/supabaseClient.ts', 'utf8');
const urlMatch = content.match(/supabaseUrl\s*=\s*['"`](.*?)['"`]/);
const keyMatch = content.match(/supabaseAnonKey\s*=\s*['"`](.*?)['"`]/);
if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('profiles').select('*').limit(5).then(res => console.log(JSON.stringify(res.data, null, 2)));
} else {
  console.log('Not found');
}
