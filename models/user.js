const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/miniProjectDB");

const userSchema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  age: Number,
  profilePic: {
    type: String,
    default: "default.avif"
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("user", userSchema);
