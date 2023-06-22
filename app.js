const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

const commentsRouter = require("./routes/comments.js");
//posts.js에서 객체로 감쌌기 때문에 해당 객체를 require할 때에도 객체로 불러옴
//이 때, :뒤의 변수명은 AS로 postsRouter로 사용하기 위해 설정
const postsRouter = require("./routes/posts.js");
const usersRouter = require("./routes/users.js");
const authRouter = require("./routes/auth.js");

const connect = require("./schemas");
connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", [postsRouter, commentsRouter, usersRouter, authRouter]);

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
