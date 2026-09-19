const express = require("express");
const supabase = require("../supabase");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const requireAdmin = require("../middleware/requireAdmin");

// 관리자: 전체 신청 목록 조회
router.get("/admin/requests", requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("record_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin/requests 조회 오류:", error);
    return res.status(500).json({ message: "목록을 불러올 수 없습니다." });
  }

  res.status(200).json({ requests: data });
});
// 관리자: 전체 신청 목록
router.get("/admin/requests", requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("record_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin requests 조회 오류:", error);
    return res.status(400).json({ message: "신청 목록을 불러올 수 없습니다." });
  }

  res.status(200).json({ requests: data });
});

// 관리자: 승인 / 거절 / 반려
router.patch(
  "/admin/requests/:id/status",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { status, comment } = req.body;

    if (!["approved", "rejected", "returned"].includes(status)) {
      return res.status(400).json({ message: "잘못된 상태값입니다." });
    }

    const { data, error } = await supabase
      .from("record_requests")
      .update({ status, comment: comment ?? null })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !data) {
      console.error("상태 변경 오류:", error);
      return res.status(404).json({ message: "신청을 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "처리되었습니다.", request: data });
  },
);
// 관리자: 신청 상세보기
router.get(
  "/admin/requests/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { data, error } = await supabase
      .from("record_requests")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "신청 내역을 찾을 수 없습니다." });
    }

    res.status(200).json({ request: data });
  },
);

// 관리자: 신청 상태 변경 (승인/반려)
router.patch(
  "/admin/requests/:id/status",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { status, comment } = req.body;

    if (!["pending", "approved", "rejected", "returned"].includes(status)) {
      return res.status(400).json({ message: "올바르지 않은 상태값입니다." });
    }

    const { error } = await supabase
      .from("record_requests")
      .update({ status, comment: comment ?? null })
      .eq("id", req.params.id);

    if (error) {
      console.error("상태 변경 오류:", error);
      return res.status(400).json({ message: "상태 변경에 실패했습니다." });
    }

    res.status(200).json({ message: "상태가 변경되었습니다." });
  },
);

router.post("/request", requireAuth, async (req, res) => {
  try {
    const { name, applicantType, phone, email, recordDate, description } =
      req.body;

    if (
      !name ||
      !applicantType ||
      !phone ||
      !email ||
      !recordDate ||
      !description
    ) {
      return res.status(400).json({ message: "모든 항목을 입력해주세요." });
    }

    const { error } = await supabase.from("record_requests").insert({
      user_id: req.user.id,
      name,
      applicant_type: applicantType,
      phone,
      email,
      record_date: recordDate,
      description,
    });

    if (error) {
      console.error("record_requests INSERT 오류:", error);
      return res
        .status(400)
        .json({ message: "신청 처리 중 오류가 발생했습니다." });
    }

    res.status(201).json({ message: "신청이 완료되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});
router.get("/my-requests", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("record_requests")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("my-requests 조회 오류:", error);
      return res
        .status(400)
        .json({ message: "신청 목록을 불러올 수 없습니다." });
    }

    res.status(200).json({ requests: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});
module.exports = router;
