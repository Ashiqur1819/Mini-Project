const express = require("express");
const app = express();

const path = require("path");
const cookieParser = require("cookie-parser");
const userModel = require("./models/user");
const postModel = require("./models/post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require("./config/multer.config");

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Middlewares

const isLoggedIn = (req, res, next) => {
  if (req.cookies.token === "") {
    res.redirect("/login");
  } else {
    jwt.verify(req.cookies.token, "Nusrat", function (err, decoded) {
      if (err) {
        res.send("Invalid Token");
      } else {
        req.user = decoded;
        next();
      }
    });
  }
};

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  const { name, username, email, password, age } = req.body;

  const user = await userModel.findOne({ email });

  if (user) return res.status(500).send("Already have an account.");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      await userModel.create({
        name,
        username,
        email,
        password: hash,
        age,
      });

      const token = jwt.sign({ username, email }, "Nusrat");
      res.cookie("token", token);

      res.redirect("/profile");
    });
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) return res.status(500).send("Something went wrong!");

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      const token = jwt.sign(
        { username: user.username, email: user.email },
        "Nusrat"
      );
      res.cookie("token", token);
      res.redirect("/profile");
    } else res.send("Something went wrong!");
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");

  res.render("profile", { user });
});

app.post("/post", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });

  const { content } = req.body;

  const post = await postModel.create({
    user: user._id,
    content,
  });

  user.posts.push(post._id);
  await user.save();

  res.redirect("/profile");
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });

  const post = await postModel.findOne({ _id: req.params.id }).populate("user");

  if (post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id);
  } else {
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }

  await post.save();
  res.redirect("/profile");
});

app.get("/profile/upload", (req, res) => {
  res.render("profileUpload");
});

app.post(
  "/upload",
  upload.single("profilePic"),
  isLoggedIn,
  async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });
    user.profilePic = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

app.listen(3000);
