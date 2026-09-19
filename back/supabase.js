const { createClient } = require("@supabase/supabase-js");

const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

// 관리자 권한 클라이언트: DB 조회/관리 전용. signIn 호출 금지
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  options,
);

// 로그인 검증용: 호출할 때마다 새 클라이언트 생성
function createAuthClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    options,
  );
}

module.exports = supabase;
module.exports.createAuthClient = createAuthClient;
