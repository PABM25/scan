import 'package:flutter/material.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';

class OcrScreen extends StatefulWidget {
  final String imagePath;
  const OcrScreen({super.key, required this.imagePath});

  @override
  State<OcrScreen> createState() => _OcrScreenState();
}

class _OcrScreenState extends State<OcrScreen> {
  String extractedText = '';
  bool isProcessing = true;

  @override
  void initState() {
    super.initState();
    _processImage();
  }

  Future<void> _processImage() async {
    final inputImage = InputImage.fromFilePath(widget.imagePath);
    final textRecognizer = TextRecognizer(script: TextRecognitionScript.latin);

    try {
      final RecognizedText recognizedText = await textRecognizer.processImage(inputImage);
      setState(() {
        extractedText = recognizedText.text;
        isProcessing = false;
      });
    } catch (e) {
      setState(() {
        extractedText = 'Failed to extract text: \$e';
        isProcessing = false;
      });
    } finally {
      textRecognizer.close();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Extracted Text'),
        actions: [
          IconButton(
            icon: const Icon(Icons.copy),
            onPressed: () {
               // Copy to clipboard placeholder
               ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Text copied!')));
            },
          )
        ],
      ),
      body: isProcessing
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: SingleChildScrollView(
                child: TextField(
                  maxLines: null,
                  controller: TextEditingController(text: extractedText),
                  decoration: const InputDecoration(border: InputBorder.none),
                ),
              ),
            ),
    );
  }
}
