import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final LocalAuthentication auth = LocalAuthentication();
  bool _isAuthenticating = false;

  Future<void> _authenticate() async {
    setState(() {
      _isAuthenticating = true;
    });
    try {
      final isSupported = await auth.isDeviceSupported();
      final canCheckBiometrics = await auth.canCheckBiometrics;

      if (!isSupported || !canCheckBiometrics) {
        // Fallback if biometrics are not supported
        if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Biometrics not supported, proceeding...')));
           Navigator.pushReplacement(
             context,
             MaterialPageRoute(builder: (context) => const HomeScreen()),
           );
        }
        return;
      }

      final bool didAuthenticate = await auth.authenticate(
        localizedReason: 'Please authenticate to access your scans',
      );
      if (didAuthenticate && mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const HomeScreen()),
        );
      }
    } catch (e) {
      debugPrint(e.toString());
      if (mounted) {
         ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Authentication error: \$e')));
      }
    } finally {
      if (mounted) {
        setState(() {
          _isAuthenticating = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E1E),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.document_scanner, size: 80, color: Colors.blueAccent),
            const SizedBox(height: 20),
            const Text('ProScanner', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 8),
            const Text('Secure Document Vault', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 60),
            ElevatedButton.icon(
              onPressed: _isAuthenticating ? null : _authenticate,
              icon: const Icon(Icons.fingerprint, size: 32),
              label: Text(_isAuthenticating ? 'Verifying...' : 'Unlock with Biometrics'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                textStyle: const TextStyle(fontSize: 18),
              ),
            ),
            const SizedBox(height: 20),
            TextButton(
              onPressed: () {
                // Bypass for dev purposes since emulator might not have biometrics setup easily
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const HomeScreen()),
                );
              },
              child: const Text('Bypass (Dev Only)', style: TextStyle(color: Colors.grey)),
            )
          ],
        ),
      ),
    );
  }
}
