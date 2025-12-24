const multer = require("multer")
const crypto = require("crypto")
const path = require("path")


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "public/images/uploads"));
  },
  filename: function (req, file, cb) {

    crypto.randomBytes(12, (err, name) => {
        const fileName = name.toString("hex")+path.extname(file.originalname)
        cb(null, fileName)
    })
    
  }
})

module.exports = upload = multer({ storage: storage })