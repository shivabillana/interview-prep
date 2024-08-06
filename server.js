const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
require('dotenv').config();
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);

// Define a schema and model for questions
const questionSchema = new mongoose.Schema({
    topic: String,
    question: String,
    answer: String
});

const Question = mongoose.model('Question', questionSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landingpage.html'));
});

// Route to get questions for a specific topic
app.get('/api/topics/:topic', async (req, res) => {
    const topic = req.params.topic;
    try {
        const questions = await Question.find({ topic });
        res.json(questions);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Route to add a new question for a specific topic
app.post('/api/topics/:topic', async (req, res) => {
    const topic = req.params.topic;
    const { question, answer } = req.body;

    const newQuestion = new Question({
        topic,
        question,
        answer
    });

    try {
        await newQuestion.save();
        res.status(201).send('Question added successfully');
    } catch (err) {
        res.status(500).send(err);
    }
});

// Connect to MongoDB
const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});