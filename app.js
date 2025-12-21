const express = require("express")
const app = express()

const path = require("path")
const cookieParser = require("cookie-parser")
const userModel = require("./models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

app.set("view engine", "ejs")

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, "public")))
app.use(cookieParser())


app.get("/", (req, res) => {
    res.render("index")
})

app.post("/register", async(req, res) => {

    const {name, username, email, password, age} = req.body

    const user = await userModel.findOne({email})

    if(user) return res.status(500).send("Already have an account.")

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async(err, hash) => {
        await userModel.create({
        name,
        username,
        email,
        password : hash,
        age
    })

    const token = jwt.sign({username, email}, "Nusrat")
    res.cookie("token", token)

    res.send("Registration Success!")

    });
    })
 
    
})



app.listen(3000)