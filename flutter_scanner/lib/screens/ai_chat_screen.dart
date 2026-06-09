import 'package:flutter/material.dart';
import 'dart:async';

class AiChatScreen extends StatefulWidget {
  const AiChatScreen({super.key});

  @override
  State<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends State<AiChatScreen> {
  final List<Map<String, String>> _messages = [
    {'sender': 'ai', 'text': 'Hi! I am your AI assistant, now running serverless. I can analyze your documents. Ask me anything!'}
  ];
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isTyping = false;

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _sendMessage() {
    if (_controller.text.trim().isEmpty) return;

    final question = _controller.text;
    setState(() {
      _messages.add({'sender': 'user', 'text': question});
      _isTyping = true;
    });

    _controller.clear();
    _scrollToBottom();

    // Simulate Serverless AI response (e.g. Firebase Cloud Function stream)
    Future.delayed(const Duration(milliseconds: 600), () {
      if (!mounted) return;

      setState(() {
        _isTyping = false;
        // Start with empty message to simulate streaming
        _messages.add({'sender': 'ai', 'text': ''});
      });
      _scrollToBottom();

      _simulateStreamingResponse(question);
    });
  }

  void _simulateStreamingResponse(String question) async {
    String answer = "I am a simulated AI assistant powered by Firebase Cloud Functions. ";

    final qLower = question.toLowerCase();
    if (qLower.contains('summary') || qLower.contains('resumen')) {
        answer += "Here is the summary of the document: It appears to be an invoice or receipt that was successfully scanned and uploaded to Firebase Storage.";
    } else {
        answer += "You asked: '$question'. As a demo, I'm streaming this response word-by-word.";
    }

    final words = answer.split(' ');

    for (int i = 0; i < words.length; i++) {
      await Future.delayed(const Duration(milliseconds: 80));
      if (!mounted) break;

      setState(() {
        final currentText = _messages.last['text']!;
        _messages[_messages.length - 1]['text'] = "$currentText${words[i]} ";
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.smart_toy, color: Colors.purpleAccent),
            SizedBox(width: 8),
            Text('AI Assistant'),
          ],
        ),
        backgroundColor: const Color(0xFF1E1E1E),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg['sender'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.8,
                    ),
                    decoration: BoxDecoration(
                      color: isUser ? Colors.blueAccent[700] : const Color(0xFF2C2C2E),
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: Radius.circular(isUser ? 16 : 4),
                        bottomRight: Radius.circular(isUser ? 4 : 16),
                      ),
                    ),
                    child: Text(
                      msg['text']!,
                      style: const TextStyle(color: Colors.white, fontSize: 16, height: 1.4),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isTyping)
             const Padding(
               padding: EdgeInsets.all(8.0),
               child: Align(
                 alignment: Alignment.centerLeft,
                 child: Text("AI is thinking...", style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)),
               ),
             ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 12.0),
            color: const Color(0xFF1E1E1E),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Ask about your scan...',
                        hintStyle: const TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: const Color(0xFF2C2C2E),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: _sendMessage,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: const BoxDecoration(
                        color: Colors.blueAccent,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.send, color: Colors.white, size: 24),
                    ),
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
