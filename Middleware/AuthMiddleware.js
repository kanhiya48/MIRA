const User = require("../Models/UserModel");
require('dotenv').config();

const jwt = require("jsonwebtoken");
module.exports.apiMiddleware = (req, res,next) => {
  const token = req.cookies.token
  console.log("in api middleware", token)
  if (!token) {
    return res.json({ status: false })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
     return res.json({ error: "token is not verified" })
    } else {
      const user = await User.findById(data.id)
      if (user) {
        req.user=user;
        next();
      }
      else return res.json({ error: "token problem try login again"})
    }
  })
}