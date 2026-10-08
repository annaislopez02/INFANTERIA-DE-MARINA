import 'package:flutter/material.dart';
import 'screens/map_screen.dart';

void main() {
  runApp(const TacNavApp());
}

class TacNavApp extends StatelessWidget {
  const TacNavApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TacNav IM Chile',
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF1B3B2B), // Marine green
        scaffoldBackgroundColor: const Color(0xFF121212),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1B3B2B),
          elevation: 0,
        ),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF2C5E43),
          secondary: Colors.amber, // Accent color for tactical elements
        ),
      ),
      home: const MapScreen(),
    );
  }
}
