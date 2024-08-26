const User = require("../Models/UserModel");
const { createSecretToken } = require("../Util/JWT");
const bcrypt = require("bcryptjs");
const {createUniqueId}= require("../Util/Uniqueid");
const {sendVerifyMail}=require("../Util/Mailer");
module.exports.Signup = async (req, res, next) => {
  try {
    console.log(req.body)
    const { email, password, username, createdAt } = req.body;
  
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isConfirmed==true) {
      return res.json({ message: "User already exists" });
    }
    if(existingUser && existingUser.isConfirmed==false){
      const confirmationId=await createUniqueId();
       await User.updateOne(
  { _id: existingUser._id }, // Filter to find the document
  { $set: { confirmationId: confirmationId } } // Update operation
);
      await sendVerifyMail(email,confirmationId);
       res
      .status(201)
      .json({ message: " user already exists Confimation Link has been sent to your Registered Email ID", success: true });
      return;
    }
    const confirmationId=await createUniqueId();
    const isConfirmed=false;
    const interviewHistory=[];
    const user = await User.create({ email, password, username, createdAt , confirmationId, isConfirmed,interviewHistory });
    // const token = createSecretToken(user._id);
    await sendVerifyMail(email,confirmationId);
    res
      .status(201)
      .json({ message: "Confimation Link has been sent to your Registered Email ID", success: true });
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // console.log("emain",email,password)
    if(!email || !password ){
      return res.json({message:'All fields are required'})
    }
    const user = await User.findOne({ email });
    if(!user){
      console.log("notuser")
      return res.json({message:'Incorrect password or email' }) 
    }
    if(user.isConfirmed==false)
    {
       return  res.json({success:false,message:"Email not verified"})
       
    }
    const auth = await bcrypt.compare(password,user.password)
    if (!auth) {
      console.log("notauth")
      return res.json({message:'Incorrect password or email' }) 
    }
     const token = createSecretToken(user._id);
     console.log(token)
     res.cookie("token", token, {
       withCredentials: true,
       httpOnly: false,
     });
     res.status(201).json({ message: "User logged in successfully", success: true, username:user.username, interviewHistory:user.interviewHistory});
     next()
  } catch (error) {
    console.error(error);
  }
}
module.exports.verify=async (req,res,next)=>{
    const {uid}=req.body;
    // console.log(uid)
    const document = await User.findOneAndUpdate({ confirmationId: uid }, // Search criteria
  { isConfirmed: true })// New value to set

    if (document) {
      console.log('Found document:', document);
      res.json({message:"user verified",success:true})
      // Do something with the found document
    } else {
      console.log('Document not found');
      res.json({message:"user not confirmed try again",success:false})
      // Handle the case where the document is not found
    }
  

}


module.exports.getUserDetails = async (req, res, next) => {
  try {
    const userId=req.user;
    console.log("user  ",userId)
      const user = await User.findById(userId).exec();
        if (user) {
          console.log("working")
           res.json({status:true,interviewHistory:user.interviewHistory,username:user.username})
        } else {
            res.json({status:false, error:"user not present in database"});
        }
    
   
    next();
  } catch (error) {
    console.error(error);
  }
};
  module.exports.setScore = async (req, res, next) => {
  try {
    const { domain, score } = req.body.payload;
    const userId = req.user;

    const userResult = { domain, score };
  console.log("interview history detil ",req.body);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { interviewHistory: userResult } },
      { new: true }
    );

    if (updatedUser) {
      console.log('Updated user:', updatedUser);
      res.json({ status: true, message: 'Score added successfully' });
    } else {
      console.error('Error updating user: User not found');
      res.json({ status: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.json({ status: false, error: 'An error occurred' });
  } finally {
    next(); // Call next() if necessary for further middleware
  }
};



module.exports.requestOtp = async (req, res, next) => {
  try {
    console.log(req.body)
    const { email } = req.body;
  
    const existingUser = await User.findOne({ email });
    if (existingUser) 
      {
      const otp = await createUniqueId();
            await User.updateOne(
                { _id: existingUser._id }, // Filter to find the document
                { $set: { otp: otp } } // Update operation
                );
            await sendVerifyMail(email,otp);   
            res.json({message:"OTP has been sent to your email ID", success: true});
      }
    else{
      res.status(404).json({message: "user with this email not found", success:false});
    }
   
    next();
  }catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error" , success: false});
  }
};

module.exports.verifyOtp=async (req,res,next)=>{
    const {email, otp}=req.body;
    // console.log(uid)
    const document = await User.findOne({ email })// Search criteria
    if (document) {
      console.log('Found document:', document);
      if(document.otp == otp)
      {
     const token = createSecretToken(document._id);
     console.log(token)
     res.cookie("token", token, {
       withCredentials: true,
       httpOnly: false,
     });
     res.json({message:"user verified",success:true})
      }
      else{
        res.json({message:"OTP is not matched, Try Again", success: false})
      }
    } else {
      console.log('Document not found');
      res.json({message:"user not found",success:false})
      // Handle the case where the document is not found
    }
  

}

module.exports.resetPassword= async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user; // Assuming verifyTokenMiddleware adds user info to req
  
 try {
    const user = await User.findById(userId);
    if (!user) 
      {
        res.status(404).json({message:"user not found", success:false})
      }
    else{
    user.password = newPassword; // This will trigger the pre-save hook
    await user.save();
    console.log('Password updated successfully');
     res.status(200).json({message:"password updated", success:true});
    }
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({message:"Internal Server Error", success: false});
  }
};