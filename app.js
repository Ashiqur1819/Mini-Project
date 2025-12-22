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


// Middlewares

const isLoggedIn  = (req, res, next) => {

    if(req.cookies.token === ""){
        res.redirect("/login")
    }
    else{
        jwt.verify(req.cookies.token, 'Nusrat', function(err, decoded) {
            if(err){
                res.send("Invalid Token")
            }else{
                res.user = decoded
                next()
            }
});
    }
}


app.get("/", (req, res) => {
    res.render("index")
})

app.get("/login", (req, res) => {
    res.render("login")
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


app.post("/login", async(req, res) => {

    const {email, password} = req.body

    const user = await userModel.findOne({email})

    if(!user) return res.status(500).send("Something went wrong!")

    bcrypt.compare(password, user.password, function(err, result) {
    if(result){
        const token = jwt.sign({username: user.username, email: user.email}, "Nusrat")
    res.cookie("token", token)
        res.redirect("/profile")
    }
    else
        res.send("Something went wrong!")
});

    
    
})

app.get("/logout", (req, res) => {
    res.cookie("token", "")
    res.redirect("/login")
})


app.get("/profile", isLoggedIn, async (req, res) => {

    const user = await res.user

    console.log(user)
    res.render("profile", {user})
})



app.listen(3000)