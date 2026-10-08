import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../models/waypoint.dart';
import '../widgets/tactical_overlay.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  
  // Tactical data
  LatLng _currentLocation = const LatLng(-33.0456, -71.6114); // Valparaiso default
  final List<Waypoint> _waypoints = [
    Waypoint(
      id: '1',
      position: const LatLng(-33.0333, -71.6214), // Base naval
      type: WaypointType.friendly,
      label: 'Base Naval',
    ),
    Waypoint(
      id: '2',
      position: const LatLng(-33.0555, -71.6014),
      type: WaypointType.hostile,
      label: 'Zona Conflicto',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('TacNav IM Chile', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: () {
              _mapController.move(_currentLocation, 15.0);
            },
          ),
          IconButton(
            icon: const Icon(Icons.layers),
            onPressed: () {
              // Toggle map layers (Satellite/Terrain)
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Cambiando capa del mapa (Mock)')),
              );
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentLocation,
              initialZoom: 13.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'cl.armada.im.tacnav',
              ),
              MarkerLayer(
                markers: _buildMarkers(),
              ),
            ],
          ),
          Positioned(
            bottom: 20,
            left: 10,
            right: 10,
            child: TacticalOverlay(
              currentLocation: _currentLocation,
              heading: 45.0,
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add WP
        },
        backgroundColor: Colors.amber,
        child: const Icon(Icons.add_location_alt, color: Colors.black),
      ),
    );
  }

  List<Marker> _buildMarkers() {
    return _waypoints.map((wp) {
      Color markerColor = Colors.grey;
      IconData markerIcon = Icons.location_on;
      
      switch (wp.type) {
        case WaypointType.friendly:
          markerColor = Colors.blue;
          markerIcon = Icons.shield;
          break;
        case WaypointType.hostile:
          markerColor = Colors.red;
          markerIcon = Icons.warning;
          break;
        case WaypointType.neutral:
          markerColor = Colors.green;
          break;
        case WaypointType.unknown:
          markerColor = Colors.yellow;
          break;
      }

      return Marker(
        point: wp.position,
        width: 80,
        height: 80,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(markerIcon, color: markerColor, size: 30),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                wp.label,
                style: const TextStyle(color: Colors.white, fontSize: 10),
              ),
            ),
          ],
        ),
      );
    }).toList();
  }
}
