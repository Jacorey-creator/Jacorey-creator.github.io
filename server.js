require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        console.log('Upload directory:', uploadDir);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            console.log('Creating upload directory...');
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + '-' + file.originalname;
        console.log('Saving file:', filename);
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Project Schema
const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    webLink: { type: String },
    files: [{ type: String }],
    images: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Create initial admin user if none exists
async function createInitialAdmin() {
    try {
        const adminExists = await User.findOne({ username: 'Afroman' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('jacorey721', 10);
            await User.create({
                username: 'Afroman',
                password: hashedPassword
            });
            console.log('Admin user created successfully');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

createInitialAdmin();

// Login route
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

// Protected routes
app.post('/api/projects', authenticateToken, upload.fields([
    { name: 'projectFiles', maxCount: 5 },
    { name: 'imageGallery', maxCount: 10 }
]), async (req, res) => {
    try {
        const { projectName, description, webLink } = req.body;
        
        console.log('Received files:', req.files);
        
        const files = req.files['projectFiles']?.map(file => `/uploads/${file.filename}`) || [];
        const images = req.files['imageGallery']?.map(file => `/uploads/${file.filename}`) || [];

        console.log('Processed file paths:', files);
        console.log('Processed image paths:', images);

        const project = new Project({
            name: projectName,
            description,
            webLink,
            files,
            images
        });

        await project.save();
        console.log('Saved project:', project);
        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Error creating project' });
    }
});

// Add delete endpoint
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Delete associated files
        const deleteFile = (filePath) => {
            const fullPath = path.join(__dirname, 'public', filePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        };

        // Delete project files
        project.files.forEach(deleteFile);
        project.images.forEach(deleteFile);

        // Delete project from database
        await Project.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Error deleting project' });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        console.log('Projects found:', projects); // Debug log
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Error fetching projects' });
    }
});

// Add debug route for checking image paths
app.get('/api/debug/images', async (req, res) => {
    try {
        const projects = await Project.find();
        const imagePaths = projects.map(project => ({
            projectName: project.name,
            images: project.images
        }));
        res.json(imagePaths);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a route to check if an image exists
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'public', 'uploads', filename);
    console.log('Attempting to serve image:', filepath);
    
    if (fs.existsSync(filepath)) {
        console.log('Image found, sending file');
        res.sendFile(filepath);
    } else {
        console.log('Image not found:', filepath);
        res.status(404).send('Image not found');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 