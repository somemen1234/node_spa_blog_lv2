const express = require("express");
const router = express.Router();

//exports 시, 객체로 내보냈기 때문에 받을 때에도 객체로 받아야 함.
const { checkObjectId } = require("./posts.js");
const Comment = require("../schemas/comment.js");
const Post = require("../schemas/post.js");
const authMiddleware = require("../middlewares/auth-middleware.js");
//ObjectId의 타입을 활용하기 위해 할당
const { ObjectId } = require("mongoose").Types;

//댓글 목록 조회
//해당 _id 게시글의 모든 댓글을 보여주도록 구현(생성일자별 내림차순)
router.get("/posts/:postId/comments", checkObjectId, async (req, res) => {
  try {
    const { postId } = req.params;

    const findComments = await Comment.find({ postId: new ObjectId(postId) }).sort({
      createdAt: -1,
    });

    if (findComments.length === 0)
      return res
        .status(404)
        .json({ success: false, errorMessage: "해당 게시글의 댓글을 찾을 수 없습니다." });

    let results = findComments.map((comment) => {
      return {
        commentId: comment._id,
        userId: comment.userId,
        nickname: comment.nickname,
        comment: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    });

    res.status(200).json({ success: true, comments: results });
  } catch (error) {
    return res.status(400).json({ success: false, errorMessage: "댓글 조회에 실패하였습니다." });
  }
});

//댓글 작성
router.post("/posts/:postId/comments", checkObjectId, authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const nickname = res.locals.userNickname;
    const { postId } = req.params;
    const { content } = req.body;

    const existComment = await Post.findById(postId);
    if (!existComment)
      return res
        .status(404)
        .json({ success: false, errorMessage: "해당 게시글을 찾을 수 없습니다." });

    if (!content)
      return res
        .status(412)
        .json({ success: false, errorMessage: "댓글 정보가 입력되지 않았습니다." });

    await Comment.create({ postId: existComment._id, userId, nickname, content });
    res.status(201).json({ success: true, message: "댓글을 생성하였습니다." });
  } catch (error) {
    return res.status(400).json({ success: false, errorMessage: "댓글 작성에 실패헀습니다." });
  }
});

//댓글 수정
router.put("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const { commentId } = req.params;
    const { content } = req.body;

    if (!ObjectId.isValid(commentId) || !ObjectId.isValid(postId))
      return res
        .status(412)
        .json({ success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });

    const existComment = await Comment.findById(commentId);
    const existPost = await Post.findById(postId);

    if (!existPost)
      return res.status(404).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });

    if (!existComment)
      return res.status(404).json({ success: false, errorMessage: "댓글이 존재하지 않습니다." });

    if (postId !== existComment.postId)
      return res.status(404).json({
        success: false,
        errorMessage: "검색한 게시물과 수정할 댓글의 게시물이 일치하지 않습니다.",
      });

    if (userId !== existComment.userId)
      return res
        .status(403)
        .json({ success: false, errorMessage: "댓글의 수정 권한이 존재하지 않습니다." });

    if (!content)
      return res.status(400).json({
        success: false,
        errorMessage: "댓글이 비어 있습니다. 수정할 댓글을 입력해주세요.",
      });

    await Comment.updateOne({ _id: commentId }, { $set: { content: content } });
    res.status(201).json({ success: true, message: "댓글을 수정하였습니다." });
  } catch (error) {
    return res.status(400).json({ success: false, errorMessage: "댓글 수정에 실패했습니다." });
  }
});

//댓글 삭제
router.delete("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const { commentId } = req.params;

    if (!ObjectId.isValid(commentId) || !ObjectId.isValid(postId))
      return res
        .status(412)
        .json({ success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });

    const existComment = await Comment.findById(commentId);
    const existPost = await Post.findById(postId);

    if (!existPost)
      return res.status(404).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });

    if (!existComment)
      return res.status(404).json({ success: false, errorMessage: "댓글이 존재하지 않습니다." });

    if (postId !== existComment.postId)
      return res.status(404).json({
        success: false,
        errorMessage: "검색한 게시물과 수정할 댓글의 게시물이 일치하지 않습니다.",
      });

    if (userId !== existComment.userId)
      return res
        .status(403)
        .json({ success: false, message: "댓글의 삭제 권한이 존재하지 않습니다." });

    await Comment.deleteOne(existComment);
    return res.status(200).json({ success: true, message: "댓글을 삭제하였습니다." });
  } catch (error) {
    return res.status(400).json({ success: false, errorMessage: "댓글 삭제에 실패했습니다." });
  }
});

module.exports = router;
