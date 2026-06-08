const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    res.json({ message: 'File uploaded successfully', url: fileUrl, filename: req.file.filename });
});

app.post('/api/chat', (req, res) => {
    const { question, context } = req.body;

    // This is a mocked AI response since we don't have an OpenAI key or similar
    // In a real application, we would send `question` and `context` to an LLM here

    let answer = "I'm a simulated AI assistant.";

    const qLower = question.toLowerCase();

    if (qLower.includes('resumen') || qLower.includes('summary')) {
        answer = "Based on the scanned text, here is a summary: The document contains some text, but as a mock AI, I can only see that it has " + (context ? context.length : 0) + " characters.";
    } else if (qLower.includes('key points') || qLower.includes('puntos clave')) {
        answer = "Key points from the document:\n1. It was scanned successfully.\n2. OCR extracted " + (context ? context.length : 0) + " characters.\n3. (Mock AI response)";
    } else {
        answer = "You asked: '" + question + "'. Based on the context provided, I can see the document contains text like: '" + (context ? context.substring(0, 50) + "..." : "Nothing") + "'. Note: I am a mock AI.";
    }

    // Simulate network delay
    setTimeout(() => {
        res.json({ answer });
    }, 1500);
});

app.use('/uploads', express.static(uploadsDir));

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
