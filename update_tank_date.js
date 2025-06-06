require('dotenv').config();
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  webLink: String,
  files: [String],
  images: [String],
  createdAt: Date
});

const Project = mongoose.model('Project', projectSchema);

async function revertTankDate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await Project.findOneAndUpdate(
    { name: 'Tactical_Armored_Nanite_Kaizen' },
    { createdAt: new Date('2025-06-06T03:47:01.000Z') },
    { new: true }
  );
  if (result) {
    console.log('Reverted project:', result);
  } else {
    console.log('Project not found.');
  }
  await mongoose.disconnect();
}

revertTankDate(); 