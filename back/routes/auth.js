const express = require("express");
const supabase = require("../supabase");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    if (!email || !password || !nickname) {
      return res.status(400).json({
        message: "이메일, 비밀번호, 닉네임을 모두 입력해주세요.",
      });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    const { error: userError } = await supabase.from("users").insert({
      id: data.user.id,
      nickname: nickname,
      role: "user",
    });

    if (userError) {
      console.error("users 테이블 INSERT 오류:", userError);

      return res.status(400).json({
        message: userError.message,
      });
    }

    res.status(201).json({
      message: "회원가입 성공",
      user: {
        id: data.user.id,
        email: data.user.email,
        nickname: nickname,
        role: "user",
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "서버 오류가 발생했습니다.",
    });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { nickname, password } = req.body;

    if (!nickname || !password) {
      return res.status(400).json({
        message: "아이디와 비밀번호를 모두 입력해주세요.",
      });
    }

    const { data: userRow, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("nickname", nickname)
      .single();
    if (findError || !userRow) {
      return res.status(401).json({
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(userRow.id);

    if (authError || !authUser) {
      return res.status(401).json({
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: authUser.user.email,
      password,
    });
    if (error) {
      return res.status(401).json({
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    res.status(200).json({
      message: "로그인 성공",
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        nickname: nickname,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});
module.exports = router;
