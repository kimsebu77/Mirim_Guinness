const supabase = require("../supabase");

async function requireAdmin(req, res, next) {
  // requireAuth가 먼저 실행되어 req.user가 있다고 가정
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", req.user.id)
    .single();

  if (error || !data || data.role !== "admin") {
    return res.status(403).json({ message: "관리자만 접근할 수 있습니다." });
  }

  next();
}

module.exports = requireAdmin;
