import 'dart:io';
import 'package:flutter/material.dart';
import 'camera_screen.dart';
import 'processor_screen.dart';
import 'ocr_screen.dart';
import '../services/pdf_service.dart';
import 'ai_chat_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<String> pages = [];
  bool isUploading = false;

  void _openCamera() async {
    final imagePath = await Navigator.push<String>(
      context,
      MaterialPageRoute(builder: (context) => const CameraScreen()),
    );

    if (imagePath != null) {
      _openProcessor(imagePath);
    }
  }

  void _openProcessor(String imagePath) async {
    final processedPath = await Navigator.push<String>(
      context,
      MaterialPageRoute(builder: (context) => ProcessorScreen(imagePath: imagePath)),
    );

    if (processedPath != null) {
      setState(() {
        pages.add(processedPath);
      });
      // Like Adobe scan, usually brings you back to camera to scan more, but we'll stick to home for simplicity
    }
  }

  Future<void> _exportPdf() async {
    if (pages.isEmpty) return;
    try {
      final pdfFile = await PdfService.generatePdf(pages);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('PDF Saved to \${pdfFile.path}')),
      );
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recent Scans'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {},
          ),
        ],
      ),
      body: pages.isEmpty
          ? const Center(
              child: Text('No scans yet. Tap the camera to start.'),
            )
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Expanded(
                    child: GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                      ),
                      itemCount: pages.length,
                      itemBuilder: (context, index) {
                        return Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.file(File(pages[index]), fit: BoxFit.cover),
                            Positioned(
                              top: 4,
                              right: 4,
                              child: CircleAvatar(
                                radius: 12,
                                backgroundColor: Colors.black54,
                                child: Text('\${index + 1}', style: const TextStyle(fontSize: 12, color: Colors.white)),
                              ),
                            )
                          ],
                        );
                      },
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      ElevatedButton.icon(
                        onPressed: _exportPdf,
                        icon: const Icon(Icons.picture_as_pdf),
                        label: const Text('Save PDF'),
                      ),
                      ElevatedButton.icon(
                        onPressed: () {
                          // Placeholder for Firebase upload
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Uploading to Firebase...')),
                          );
                        },
                        icon: const Icon(Icons.cloud_upload),
                        label: const Text('Cloud'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const AiChatScreen()),
                      );
                    },
                    icon: const Icon(Icons.smart_toy, color: Colors.purpleAccent),
                    label: const Text('Ask AI Assistant', style: TextStyle(color: Colors.purpleAccent)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.purple.withOpacity(0.1),
                      minimumSize: const Size(double.infinity, 50),
                    ),
                  ),
                  const SizedBox(height: 80), // Space for FAB
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openCamera,
        child: const Icon(Icons.camera_alt),
      ),
    );
  }
}
