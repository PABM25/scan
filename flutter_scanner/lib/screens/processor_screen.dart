import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:colorfilter_generator/addons.dart';
import 'ocr_screen.dart';

class ProcessorScreen extends StatefulWidget {
  final String imagePath;

  const ProcessorScreen({super.key, required this.imagePath});

  @override
  State<ProcessorScreen> createState() => _ProcessorScreenState();
}

class _ProcessorScreenState extends State<ProcessorScreen> {
  String? currentPath;
  List<double>? _currentMatrix;

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
            ? (_currentMatrix == null
                ? Image.file(File(currentPath!))
                : ColorFiltered(
                    colorFilter: ColorFilter.matrix(_currentMatrix!),
                    child: Image.file(File(currentPath!)),
                  ))
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
                 showModalBottomSheet(
                    context: context,
                    builder: (context) {
                       return Container(
                         height: 150,
                         color: const Color(0xFF2D2D2D),
                         child: Row(
                           mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                           children: [
                             _filterButton('Original', null),
                             _filterButton('Grayscale', ColorFilterAddons.grayscale()),
                             _filterButton('Sepia', ColorFilterAddons.sepia(0.5)),
                             _filterButton('Invert', ColorFilterAddons.invert()),
                           ],
                         ),
                       );
                    }
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

  Widget _filterButton(String name, List<double>? matrix) {
    return GestureDetector(
      onTap: () {
         setState(() {
            _currentMatrix = matrix;
         });
         Navigator.pop(context);
      },
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
             width: 50,
             height: 50,
             decoration: BoxDecoration(
               shape: BoxShape.circle,
               border: Border.all(color: _currentMatrix == matrix ? Colors.blueAccent : Colors.white24, width: 2),
             ),
             child: const Center(child: Icon(Icons.photo, color: Colors.white)),
          ),
          const SizedBox(height: 8),
          Text(name, style: const TextStyle(color: Colors.white, fontSize: 12)),
        ],
      ),
    );
  }
}
