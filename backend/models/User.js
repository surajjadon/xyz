const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema(
  {
    problemSlug: { type: String, required: true },   // e.g. "two-sum"
    code: { type: String, required: true },
    language: { type: String, required: true },      // cpp, python, js...
    result: { type: String, default: "Pending" },    // AC / WA / TLE / MLE etc.
    runtime: { type: Number, default: null },
    memory: { type: Number, default: null },
    submittedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    mobileNumber: { type: String },
    collegeName: { type: String },

    submissions: {
      type: [SubmissionSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
