
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDirectorInfo() {
  const email = 'woojin052501@gmail.com';
  
  // 1. Find User
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  const targetUser = users.find(u => u.email === email);
  
  if (!targetUser) {
    console.log('User not found');
    return;
  }

  const userId = targetUser.id;

  // 2. Update Profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ 
      id: userId, 
      full_name: '김원장 선생님',
      updated_at: new Date()
    });

  if (profileError) console.error('Profile update error:', profileError);
  else console.log('Profile updated: 김원장 선생님');

  // 3. Update Academy
  const { error: academyError } = await supabase
    .from('academies')
    .upsert({ 
      owner_id: userId, 
      name: '노티아 아카데미',
      updated_at: new Date()
    });

  if (academyError) console.error('Academy update error:', academyError);
  else console.log('Academy updated: 노티아 아카데미');
}

updateDirectorInfo();
