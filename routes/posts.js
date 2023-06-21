const express = require("express");
const router = express.Router();

const Post = require("../schemas/post.js");
const Comment = require("../schemas/comment.js");
const authMiddleware = require("../middlewares/auth-middleware.js");
//ObjectId의 타입을 활용하기 위해 할당
const { ObjectId } = require("mongoose").Types;

//시스템 강제 종료되는 부분을 예외 처리
//기본 검색이 ObjectId형식으로 검색을 하다보니 형식에 맞지 않으면 강제 종료가 되어 버림.
//강제 종료를 막기 위해 try catch를 사용했는데, 거의 모든 함수에서 사용해서 따로 함수로 선언
const checkObjectId = (req, res, next) => {
  const { postId } = req.params;
  try {
    if (!ObjectId.isValid(postId)) {
      throw Error("데이터 형식이 올바르지 않습니다.");
    }
    next();
  } catch (error) {
    return res.status(412).json({ success: false, errorMessage: error.message });
  }
};

//전체 게시글 목록 조회
//생성일자별 내림차 순으로 정렬
router.get("/posts", async (_, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });

    const results = posts.map((post) => {
      return {
        postId: post._id,
        userId: post.userId,
        nickname: post.nickname,
        title: post.title,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });

    if (results.length === 0)
      return res.status(404).json({ success: false, errorMessage: "작성된 게시글이 없습니다." });

    res.status(200).json({ success: true, posts: results });
  } catch (error) {
    return res.status(400).json({ success: false, errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

//게시글 등록하기
//모든 정보 입력하도록 validation check
router.post("/posts", authMiddleware, async (req, res) => {
  try {
    const user = res.locals.user;
    const userNickname = res.locals.userNickname;
    const { title, content } = req.body;

    if (!title || !content)
      return res
        .status(412)
        .json({ success: false, errorMessage: "게시글의 정보가 입력되지 않았습니다." });

    await Post.create({ userId: user._id, nickname: userNickname, title, content });

    res.status(201).json({ success: true, message: "게시글을 생성하였습니다" });
  } catch (error) {
    return res.status(400).json({ success: false, errorMessage: "게시글 작성에 실패했습니다." });
  }
});

//게시글 조회(_id를 통해서)
router.get("/posts/:postId", checkObjectId, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post)
      return res
        .status(404)
        .json({ success: false, errorMessage: "해당 게시글을 찾을 수 없습니다." });

    res.status(200).json({
      postId: post._id,
      userId: post.userId,
      nickname: post.nickname,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
  } catch (error) {
    return res.status(400).json({ success: false, errorMessage: "게시글 조회에 실패했습니다." });
  }
});

//게시글 수정
router.put("/posts/:postId", checkObjectId, authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    const existPost = await Post.findById(postId);

    if (!existPost)
      return res
        .status(404)
        .json({ success: false, errorMessage: "해당 게시글을 찾을 수 없습니다." });

    if (userId !== existPost.userId)
      return res
        .status(403)
        .json({ success: false, errorMessage: "게시글 수정 권한이 존재하지 않습니다." });

    if (!title || !content)
      return res
        .status(412)
        .json({ success: false, errorMessage: "게시글 제목이나 내용이 빈 내용인지 확인해 주세요" });

    await Post.updateOne(
      { _id: postId },
      {
        $set: { title: title, content: content, updatedAt: existPost.updatedAt },
      }
    );
    res.status(201).json({ success: true, message: "게시글을 수정하였습니다." });
  } catch (error) {
    return res.status(400).json({ success: false, errorMessage: "게시글 수정에 실패했습니다." });
  }
});

//게시글 삭제
router.delete("/posts/:postId", checkObjectId, authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    const existPost = await Post.findById(postId);

    if (!existPost)
      return res
        .status(404)
        .json({ success: false, errorMessage: "해당 게시글을 찾을 수 없습니다." });

    if (userId !== existPost.userId)
      return res
        .status(403)
        .json({ success: false, errorMessage: "게시글 삭제 권한이 존재하지 않습니다." });

    await Post.deleteOne(existPost);
    await Comment.deleteMany({ postId });
    return res.status(200).json({ success: true, message: "게시글을 삭제하였습니다." });
  } catch (error) {
    return res.status(400).json({ success: false, errorMessage: "게시글 삭제에 실패했습니다." });
  }
});

//router외의 오류예외처리 함수도 내보낼 수 있도록 객체로 감쌌음
//하나의 js에서는 하나의 모듈만 exports가 가능함.
module.exports = { router, checkObjectId };
