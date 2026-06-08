import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Using dummy values to simulate Firebase initialization
  // A real app would use the generated DefaultFirebaseOptions
  try {
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: "dummy-api-key",
        appId: "dummy-app-id",
        messagingSenderId: "dummy-sender-id",
        projectId: "dummy-project-id",
      ),
    );
  } catch (e) {
    debugPrint('Firebase init error (expected with dummy config): \$e');
  }

  runApp(const ScannerApp());
}

class ScannerApp extends StatelessWidget {
  const ScannerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pro Scanner',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}
