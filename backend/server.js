require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const lessonRoutes = require('./routes/lessonRoutes');
const Problem = require("./models/Problem");
const User = require("./models/User");

const app = express();

// --------------------------
// Middleware
// --------------------------
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,              // allow cookies
  })
);

app.use(express.json());
app.use(cookieParser());

// --------------------------
// MongoDB connection
// --------------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// --------------------------
// Auth Middleware
// --------------------------
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.cookies.token; // JWT stored in cookie

  if (!token) return res.status(401).json({ error: "Unauthorized: No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // store user ID
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// --------------------------
// ROUTES
// --------------------------

/*  
=====================================
  1. GET problem by slug
=====================================
*/
app.get("/api/problems/:slug", async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/*  
=====================================
  2. Create a new problem
=====================================
*/
app.post("/api/problems", async (req, res) => {
  try {
    const newProblem = new Problem(req.body);
    await newProblem.save();
    res.json(newProblem);
  } catch (err) {
    res.status(500).json({ error: "Failed to create problem" });
  }
});

app.post("/api/problems/:slug/vote", async (req, res) => {
  try {
    const { slug } = req.params;
    const { type } = req.body; // expecting: 'like' OR 'dislike'

    if (!["like", "dislike"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Invalid vote type. Must be 'like' or 'dislike'." });
    }

    const updateField = type === "like" ? "likes" : "dislikes";

    const updatedProblem = await Problem.findOneAndUpdate(
      { slug },
      { $inc: { [updateField]: 1 } },
      { new: true }
    );

    if (!updatedProblem)
      return res.status(404).json({ error: "Problem not found" });

    res.json({
      likes: updatedProblem.likes,
      dislikes: updatedProblem.dislikes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during voting" });
  }
});

/*  
=====================================
  4. Get user submissions (JWT cookie)
=====================================
*/
app.get("/api/user/submissions", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("submissions");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ submissions: user.submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

app.use('/api/lessons', lessonRoutes);
// --------------------------
// Start Server
// --------------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
