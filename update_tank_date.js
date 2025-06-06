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

async function updateTankDate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await Project.findOneAndUpdate(
    { name: 'Tactical_Armored_Nanite_Kaizen' },
    { createdAt: new Date() },
    { new: true }
  );
  if (result) {
    console.log('Updated project:', result);
  } else {
    console.log('Project not found.');
  }
  await mongoose.disconnect();
}

updateTankDate(); 