// Dexie DB for Offline-First Storage
const db = new Dexie("TacNavV2Database");

db.version(1).stores({
    waypoints: '++id, lat, lng, type, symbology, label, comment, photo, dtg',
    routes: '++id, name, distance, waypoints, dtg',
    areaNotes: '++id, lat, lng, text, photo, screenshot, dtg',
    logbook: '++id, type, priority, content, lat, lng, dtg, timestamp'
});

window.TacNavDB = db;
