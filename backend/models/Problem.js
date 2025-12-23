const mongoose = require('mongoose');
const VariationSchema = new mongoose.Schema({
  levelId: { type: String, required: true }, 
  title: { type: String, required: true },
  difficulty: { type: String, default: "Medium" },
  constraints: { type: String, required: true },
  timeLimit: { type: String, default: "1.0 Sec" },
  memoryLimit: { type: String, default: "256 MB" },
  hints: { type: [String], default: [] }, 
  customDescription: { type: String, required: false },
  extraNote: { type: String, required: false },

  variables: { type: Map, of: String },

  testCases: [{ 
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, required: false }
  }],
});

const ProblemSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  descriptionTemplate: { type: String, required: true },       
  inputFormat: { type: String, required: true },
  outputFormat: { type: String, required: true },
  tags: [String],
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  templates: [{
    language: { type: String, required: true }, 
    functionName: { type: String, required: true },
    code: { type: String, required: true }      
  }],
   isFree: { type: Boolean, default: true }, 
  variations: [VariationSchema], 
  videoUrl: {type: String, required: true },
  thumbnailUrl: {type: String,required: false}, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', ProblemSchema);