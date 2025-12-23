const Lesson = require('../models/Lesson');
const Problem = require('../models/Problem');

// ==========================================
// 1. GET: Fetch Module & Populate Sidebar
// ==========================================
exports.getLessonBySlug = async (req, res) => {
  try {
    const { slug } = req.params; 

    const lessonContainer = await Lesson.findOne({ slug })
      .populate({
        path: 'problems.problemId', // <--- CHANGED THIS LINE
        model: 'Problem',
        select: 'title slug videoUrl difficulty isFree likes dislikes' // Select only necessary fields
      });

    if (!lessonContainer) {
      return res.status(404).json({ message: 'Lesson Module not found' });
    }

    res.status(200).json({
      success: true,
      data: lessonContainer
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 2. POST: Create the Container (e.g., "C++ Basics")
// ==========================================
exports.createLesson = async (req, res) => {
  try {
    const { title, slug, sequenceIndex, problems } = req.body;

    // 👇 THIS IS THE FIX
    // We convert ["id1", "id2"] into [{ problemId: "id1" }, { problemId: "id2" }]
    const formattedProblems = problems.map(id => ({ problemId: id }));

    const newLesson = new Lesson({
      title,
      slug,
      sequenceIndex,
      // topic: "Programming", // Uncomment if you added 'topic' back to your schema
      problems: formattedProblems // Save the formatted objects
    });

    const savedLesson = await newLesson.save();
    res.status(201).json({ success: true, data: savedLesson });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 3. PUT: Add a Problem to a Module
// ==========================================
// Call this when you create a new Problem and want to put it into "C++ Basics"
exports.addProblemsToLesson = async (req, res) => {
  try {
    const { slug } = req.params; 
    const { problems } = req.body; // Expecting an array of ID strings: ["id1", "id2"]

    // 1. Validate input
    if (!problems || !Array.isArray(problems)) {
      return res.status(400).json({ message: "Please provide an array of problem IDs." });
    }

    // 2. Format them into Objects for the Schema: ["id1"] -> [{ problemId: "id1" }]
    const problemObjects = problems.map(id => ({ problemId: id }));

    // 3. Update the Lesson
    // $addToSet prevents duplicates (unique), $push adds everything (allows duplicates)
    // We use $push here since your schema might allow the same problem twice (e.g. for revision)
    // If you want unique only, change $push to $addToSet
    const updatedLesson = await Lesson.findOneAndUpdate(
      { slug: slug },
      { 
        $push: { 
          problems: { $each: problemObjects } // $each allows pushing multiple items at once
        } 
      },
      { new: true } // Return the updated document
    );

    if (!updatedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json({
      success: true,
      message: `${problemObjects.length} problems added successfully.`,
      data: updatedLesson
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};