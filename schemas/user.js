const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

//가상화를 통해 스키마의 _id를 userId로 실제 DB에 저장하는 것이 아닌 개발환경에서 쉽게 사용하도록 가상의 스키마로 꺼내주는 것
UserSchema.virtual("userId").get(function () {
  return this._id.toHexString();
});
UserSchema.set("toJSON", {
  virtuals: true,
});

UserSchema.set("timestamps", true);

module.exports = mongoose.model("User", UserSchema);
