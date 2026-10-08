import 'package:latlong2/latlong.dart';

enum WaypointType {
  friendly,
  hostile,
  neutral,
  unknown
}

class Waypoint {
  final String id;
  final LatLng position;
  final WaypointType type;
  final String label;

  Waypoint({
    required this.id,
    required this.position,
    required this.type,
    required this.label,
  });
}
