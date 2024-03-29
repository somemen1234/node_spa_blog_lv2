const express = require("express");
const router = express.Router();
const User = require("../schemas/user.js");
const jwt = require("jsonwebtoken");

//로그인 구현
//토큰 만료시간은 1시간으로 설정했음(expiresIn: '1h')
router.post("/login", async (req, res) => {
  try {
    const { nickname, password } = req.body;
    const user = await User.findOne({ nickname });

    if (!user || user.password !== password) {
      res.status(412).json({
        success: false,
        errorMessage: "닉네임 또는 패스워드를 확인해주세요. ",
      });
      return;
    }

    const token = jwt.sign({ userId: user.userId }, "secret-login-key", { expiresIn: "1h" });

    res.cookie("Authorization", `Bearer ${token}`);
    res.status(200).json({ message: "로그인에 성공하였습니다.", token: token });
  } catch (error) {
    res.status(400).json({ success: false, errorMessage: "로그인에 실패했습니다." });
    return;
  }
});

module.exports = router;
