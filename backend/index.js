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

    // Check if the client wants SSE (Server-Sent Events)
    const acceptsSse = req.headers.accept && req.headers.accept.includes('text/event-stream');

    let answer = "I'm a simulated AI assistant. ";
    const qLower = question.toLowerCase();

    if (qLower.includes('resumen') || qLower.includes('summary')) {
        answer += "Based on the scanned text, here is a summary: The document contains some text. As a mock AI, I can only see that it has " + (context ? context.length : 0) + " characters.";
    } else if (qLower.includes('key points') || qLower.includes('puntos clave')) {
        answer += "Key points from the document:\n1. It was scanned successfully.\n2. OCR extracted " + (context ? context.length : 0) + " characters.\n3. Keep scanning!";
    } else {
        answer += "You asked: '" + question + "'. Based on the context provided, I can see the document contains text like: '" + (context ? context.substring(0, 30) + "..." : "Nothing") + "'.";
    }

    if (acceptsSse) {
        // Real-time streaming response using SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const words = answer.split(' ');
        let i = 0;

        const interval = setInterval(() => {
            if (i < words.length) {
                res.write(`data: ${JSON.stringify({ text: words[i] + ' ' })}\n\n`);
                i++;
            } else {
                res.write('data: [DONE]\n\n');
                clearInterval(interval);
                res.end();
            }
        }, 100); // Send a word every 100ms

        req.on('close', () => {
            clearInterval(interval);
        });
    } else {
        // Fallback for standard JSON request
        setTimeout(() => {
            res.json({ answer });
        }, 1500);
    }
});

app.use('/uploads', express.static(uploadsDir));

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
