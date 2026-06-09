import 'dart:io';
import 'package:flutter/material.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'camera_screen.dart';
import 'processor_screen.dart';
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
    }
  }

  Future<void> _exportPdf() async {
    if (pages.isEmpty) return;
    try {
      final File pdfFile = await PdfService.generatePdf(pages);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('PDF Saved locally to \${pdfFile.path}')),
        );
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<void> _uploadToFirebase() async {
    if (pages.isEmpty) return;

    setState(() {
      isUploading = true;
    });

    try {
      final File pdfFile = await PdfService.generatePdf(pages);
      final String fileName = 'scan_\${DateTime.now().millisecondsSinceEpoch}.pdf';

      // Upload to Firebase Storage
      final Reference storageRef = FirebaseStorage.instance.ref().child('scans/\$fileName');
      final UploadTask uploadTask = storageRef.putFile(pdfFile);
      final TaskSnapshot snapshot = await uploadTask;
      final String downloadUrl = await snapshot.ref.getDownloadURL();

      // Save metadata to Firestore
      await FirebaseFirestore.instance.collection('scans').add({
        'name': fileName,
        'url': downloadUrl,
        'pageCount': pages.length,
        'createdAt': FieldValue.serverTimestamp(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Uploaded to Firebase successfully!')),
        );
        setState(() {
          pages.clear();
        });
      }
    } catch (e) {
      debugPrint('Firebase upload error: \$e');
      if (mounted) {
        // Since we are using dummy config, it will likely fail here in dev.
        // We will show a friendly message.
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: Provide valid Firebase config to upload. \$e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          isUploading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text('Recent Scans', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E1E1E),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {},
          ),
        ],
      ),
      body: pages.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.document_scanner, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No scans yet. Tap the camera to start.', style: TextStyle(color: Colors.grey)),
                ],
              ),
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
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.file(File(pages[index]), fit: BoxFit.cover)
                            ),
                            Positioned(
                              top: 4,
                              right: 4,
                              child: CircleAvatar(
                                radius: 12,
                                backgroundColor: Colors.blueAccent,
                                child: Text('\${index + 1}', style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
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
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: isUploading ? null : _exportPdf,
                          icon: const Icon(Icons.picture_as_pdf),
                          label: const Text('Save Local'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: isUploading ? null : _uploadToFirebase,
                          icon: isUploading
                              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                              : const Icon(Icons.cloud_upload),
                          label: const Text('Firebase Sync'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blueAccent,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
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
                    label: const Text('Ask AI Assistant', style: TextStyle(color: Colors.purpleAccent, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.purple.withValues(alpha: 0.15),
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 80), // Space for FAB
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openCamera,
        backgroundColor: Colors.blueAccent,
        child: const Icon(Icons.camera_alt, color: Colors.white),
      ),
    );
  }
}
