const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AllProblem =new Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
});
const LessonSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String,  required: true, unique: true, index: true },
  sequenceIndex: {type: Number,required: true },
  problems:[AllProblem],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
LessonSchema.index({ topic: 1, sequenceIndex: 1 });

module.exports = mongoose.model('Lesson', LessonSchema);