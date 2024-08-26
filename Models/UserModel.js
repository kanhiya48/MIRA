const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const interviewHistorySchema = new mongoose.Schema({
  domain: {
    type: String, // Corrected the casing to String
    required: true // Add any other necessary validations
  },
  score: {
    type: Number,
    required: true // Add any other necessary validations
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true // Usually emails should be unique
  },
  username: {
    type: String,
    required: [true, "Your username is required"],
    unique: true // Usernames are typically unique
  },
  password: {
    type: String,
    required: [true, "Your password is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now, // Simplified default value
  },
  confirmationId: {
    type: String,
    required: true,
    unique: false,
  },
  otp: {
    type: String,
    required: false,
    unique: false,
  },
  isConfirmed: {
    type: Boolean,
    required: true,
  },
  interviewHistory: {
    type: [interviewHistorySchema]
  }
});

userSchema.pre('save', function(next) {
  const user = this;

  // Check if interviewHistory is modified
  if (user.isModified('interviewHistory')) {
    user.interviewHistory.forEach(history => {
      if (!history.timestamp) {
        history.timestamp = Date.now();
      }
    });
  }

  next();
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model("User", userSchema);