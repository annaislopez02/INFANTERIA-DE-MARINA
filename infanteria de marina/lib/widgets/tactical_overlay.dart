import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';

class TacticalOverlay extends StatelessWidget {
  final LatLng currentLocation;
  final double heading;

  const TacticalOverlay({
    super.key,
    required this.currentLocation,
    required this.heading,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1B3B2B).withOpacity(0.85),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.amber.withOpacity(0.5), width: 1),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildInfoItem('LAT', currentLocation.latitude.toStringAsFixed(5)),
          _buildInfoItem('LON', currentLocation.longitude.toStringAsFixed(5)),
          _buildInfoItem('MSR', '${heading.toStringAsFixed(1)}°'),
        ],
      ),
    );
  }

  Widget _buildInfoItem(String label, String value) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.amber,
            fontSize: 10,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }
}
