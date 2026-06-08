import 'package:flutter/material.dart';
import 'package:camera/camera.dart';

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  CameraController? _controller;
  List<CameraDescription> cameras = [];
  bool isReady = false;

  @override
  void initState() {
    super.initState();
    _setupCamera();
  }

  Future<void> _setupCamera() async {
    cameras = await availableCameras();
    if (cameras.isNotEmpty) {
      _controller = CameraController(
        cameras.first,
        ResolutionPreset.max,
        enableAudio: false,
      );
      await _controller!.initialize();
      if (mounted) {
        setState(() => isReady = true);
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!isReady || _controller == null) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_off, color: Colors.white),
            onPressed: () {},
          )
        ],
      ),
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          Positioned.fill(
            child: CameraPreview(_controller!),
          ),
          // Document Overlay guide
          Positioned.fill(
            child: Container(
              margin: const EdgeInsets.all(40),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.blue.withOpacity(0.5), width: 2),
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                IconButton(
                  icon: const Icon(Icons.photo_library, color: Colors.white, size: 32),
                  onPressed: () {
                    // Use image picker here
                  },
                ),
                GestureDetector(
                  onTap: () async {
                    try {
                      final image = await _controller!.takePicture();
                      // Navigate to processor
                      Navigator.pop(context, image.path);
                    } catch (e) {
                      debugPrint(e.toString());
                    }
                  },
                  child: Container(
                    height: 80,
                    width: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 4),
                    ),
                    child: Center(
                      child: Container(
                        height: 65,
                        width: 65,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 48), // Spacer
              ],
            ),
          ),
        ],
      ),
    );
  }
}
