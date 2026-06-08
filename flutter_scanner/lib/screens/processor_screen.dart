import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_cropper/image_cropper.dart';
import 'ocr_screen.dart';

class ProcessorScreen extends StatefulWidget {
  final String imagePath;

  const ProcessorScreen({super.key, required this.imagePath});

  @override
  State<ProcessorScreen> createState() => _ProcessorScreenState();
}

class _ProcessorScreenState extends State<ProcessorScreen> {
  String? currentPath;

  @override
  void initState() {
    super.initState();
    currentPath = widget.imagePath;
  }

  Future<void> _cropImage() async {
    final croppedFile = await ImageCropper().cropImage(
      sourcePath: currentPath!,
      uiSettings: [
        AndroidUiSettings(
            toolbarTitle: 'Crop Document',
            toolbarColor: Colors.blueGrey[900],
            toolbarWidgetColor: Colors.white,
            lockAspectRatio: false),
        IOSUiSettings(
          title: 'Crop Document',
        ),
      ],
    );

    if (croppedFile != null) {
      setState(() {
        currentPath = croppedFile.path;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF2D2D2D),
        title: const Text('Edit Document'),
        actions: [
          TextButton(
            onPressed: () {
              // Return processed image path
              Navigator.pop(context, currentPath);
            },
            child: const Text('Keep Scan', style: TextStyle(color: Colors.blueAccent)),
          )
        ],
      ),
      body: Center(
        child: currentPath != null
            ? Image.file(File(currentPath!))
            : const CircularProgressIndicator(),
      ),
      bottomNavigationBar: BottomAppBar(
        color: const Color(0xFF1E1E1E),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            IconButton(
              icon: const Icon(Icons.crop),
              color: Colors.white,
              onPressed: _cropImage,
            ),
            IconButton(
              icon: const Icon(Icons.color_lens),
              color: Colors.white,
              onPressed: () {
                 ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Filters coming soon'))
                 );
              },
            ),
            if (currentPath != null)
              IconButton(
                icon: const Icon(Icons.text_fields),
                color: Colors.blueAccent,
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => OcrScreen(imagePath: currentPath!)),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
