const router = require("express").Router();
const { Signup, Login,verify, getUserDetails, setScore,  requestOtp, verifyOtp, resetPassword } = require("../Controllers/AuthControllers");
const { apiMiddleware } = require("../Middleware/AuthMiddleware");
router.post("/signup", Signup);
router.post("/requestotp",requestOtp);
router.post("/verifyotp",verifyOtp);
router.post("/verifyuser", verify);
router.post("/login",Login)
router.post("/getuserdetails",apiMiddleware,getUserDetails)
router.post("/setscore",apiMiddleware,setScore)
router.post("/resetpassword",apiMiddleware,resetPassword)
module.exports = router;