const currentPos = [-33.0456, -71.6114];
const map = L.map('map', { zoomControl: false, doubleClickZoom: false }).setView(currentPos, 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

let waypoints = [
    { id: '1', lat: -33.0333, lng: -71.6214, type: 'friendly', symbology: 'generic', label: 'Base Naval', comment: 'Base', photo: null },
    { id: '2', lat: -33.0555, lng: -71.6014, type: 'hostile', symbology: 'infantry', label: 'Infantería', comment: 'Avistamiento', photo: null },
];

function getMarkerColor(type) {
    switch (type) {
        case 'friendly': return '#1e88e5'; // Blue
        case 'hostile': return '#e53935'; // Red
        case 'neutral': return '#43a047'; // Green
        case 'unknown': default: return '#ffb300'; // Yellow
    }
}

function getSymbologySVG(symbology) {
    // Basic APP-6 representations
    switch (symbology) {
        case 'infantry':
            return '<path d="M 5,5 L 25,25 M 25,5 L 5,25" stroke="currentColor" stroke-width="2"/>'; // Cross
        case 'armor':
            return '<ellipse cx="15" cy="15" rx="10" ry="6" stroke="currentColor" stroke-width="2" fill="none"/>'; // Oval
        case 'artillery':
            return '<circle cx="15" cy="15" r="4" fill="currentColor"/>'; // Dot
        case 'generic':
        default:
            return '<circle cx="15" cy="15" r="2" fill="currentColor"/>';
    }
}

function getTacticalIcon(wp) {
    const color = getMarkerColor(wp.type);
    const innerShape = getSymbologySVG(wp.symbology);
    // Draw NATO-like frame (Rectangle for friendly, Diamond for hostile, Square for neutral, Cloud/Clover for unknown)
    let framePath = '';
    if (wp.type === 'friendly') framePath = '<rect x="3" y="10" width="24" height="15" stroke="currentColor" stroke-width="2" fill="rgba(255,255,255,0.7)"/>';
    else if (wp.type === 'hostile') framePath = '<polygon points="15,2 28,15 15,28 2,15" stroke="currentColor" stroke-width="2" fill="rgba(255,255,255,0.7)"/>';
    else if (wp.type === 'neutral') framePath = '<rect x="4" y="4" width="22" height="22" stroke="currentColor" stroke-width="2" fill="rgba(255,255,255,0.7)"/>';
    else framePath = '<path d="M5,15 Q5,5 15,5 Q25,5 25,15 Q25,25 15,25 Q5,25 5,15" stroke="currentColor" stroke-width="2" fill="rgba(255,255,255,0.7)"/>'; // Clover approx

    const html = `
        <div style="position: relative;">
            <div class="marker-label">${wp.label}</div>
            <svg viewBox="0 0 30 30" width="40" height="40" style="color:${color};">
                ${framePath}
                ${innerShape}
            </svg>
        </div>
    `;

    return L.divIcon({
        className: 'tactical-marker',
        html: html,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
}

let markersLayer = L.layerGroup().addTo(map);
let routingControl = null;
let isRouteMode = false;

function renderMarkers() {
    markersLayer.clearLayers();
    waypoints.forEach(wp => {
        const marker = L.marker([wp.lat, wp.lng], { icon: getTacticalIcon(wp) });
        let popupContent = `<strong>${wp.label}</strong><br>Clase: ${wp.symbology.toUpperCase()} - ${wp.type.toUpperCase()}<br>${wp.comment || 'Sin comentario'}`;
        if (wp.photo) popupContent += `<br><img src="${wp.photo}" style="max-height:100px; max-width:100%; border-radius:4px; margin-top:8px;">`;
        marker.bindPopup(popupContent);

        // Handle routing click directly on the marker
        marker.on('click', (e) => {
            if (isRouteMode) {
                marker.closePopup(); // Ensure popup doesn't stay open in route mode
                handleRouteClick(e.latlng);
            }
        });

        markersLayer.addLayer(marker);
    });
}
renderMarkers();

// HUD Update logic
let currentHeading = 0.0;
map.on('move', () => {
    const center = map.getCenter();
    currentHeading = Math.random() * 360; // Mock heading
    document.getElementById('hud-lat').innerText = center.lat.toFixed(5);
    document.getElementById('hud-lon').innerText = center.lng.toFixed(5);
    document.getElementById('hud-hdg').innerText = currentHeading.toFixed(1) + '°';
});

// Buttons
document.getElementById('btn-location').addEventListener('click', () => { map.setView(currentPos, 15); });

// Route Mode Toggle
const btnRoute = document.getElementById('btn-route');
btnRoute.addEventListener('click', () => {
    isRouteMode = !isRouteMode;
    if (isRouteMode) {
        btnRoute.style.color = '#ffc107'; // Active
        routePoints = [];
        alert("Modo Ruta Táctica: Haz clic en el mapa para fijar el INICIO, y luego otro clic para marcar tu DESTINO.");
    } else {
        btnRoute.style.color = '#ffffff';
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
        tempRouteMarkers.forEach(m => map.removeLayer(m));
        tempRouteMarkers = [];
        routePoints = [];
    }
});

// Screenshot
document.getElementById('btn-screenshot').addEventListener('click', () => {
    alert("Generando Captura Táctica. Esto puede tomar unos segundos...");
    html2canvas(document.getElementById('map'), { useCORS: true }).then(canvas => {
        const screenshotData = canvas.toDataURL("image/png");

        // Add it as a new "Screenshot" Waypoint centered where we are
        const center = map.getCenter();
        const newWP = {
            id: Date.now().toString(),
            lat: center.lat,
            lng: center.lng,
            type: 'neutral',
            symbology: 'generic',
            label: 'Captura Intel',
            comment: 'Captura Táctica del Área de Operaciones',
            photo: screenshotData // We inject the screenshot as the photo
        };
        waypoints.push(newWP);
        renderMarkers();
        alert("¡Captura guardada como nuevo Waypoint (Intel) en tu posición central!");
    });
});

// Modal Logic
const modal = document.getElementById('modal-overlay');
const wpLabel = document.getElementById('wp-label');
const wpComment = document.getElementById('wp-comment');
const wpClassification = document.getElementById('wp-classification');
const wpSymbology = document.getElementById('wp-symbology');
const wpPhotoInput = document.getElementById('wp-photo');
const photoPreview = document.getElementById('photo-preview');
let currentPhotoData = null;
let pendingLatLng = null;

let routePoints = [];
let tempRouteMarkers = [];

function openModal(latlng) {
    pendingLatLng = latlng;
    modal.classList.remove('hidden');
    wpLabel.value = '';
    wpComment.value = '';
    wpPhotoInput.value = '';
    photoPreview.classList.add('hidden');
    currentPhotoData = null;
}

function handleRouteClick(latlng) {
    if (routePoints.length >= 2) {
        routePoints = [];
        tempRouteMarkers.forEach(m => map.removeLayer(m));
        tempRouteMarkers = [];
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
    }

    routePoints.push(latlng);
    const marker = L.circleMarker(latlng, {
        color: routePoints.length === 1 ? '#1e88e5' : '#e53935',
        radius: 8,
        fillOpacity: 1
    }).addTo(map);
    tempRouteMarkers.push(marker);

    if (routePoints.length === 2) {
        routingControl = L.Routing.control({
            waypoints: routePoints,
            routeWhileDragging: true,
            showAlternatives: false,
            lineOptions: { styles: [{ color: '#ffc107', opacity: 0.8, weight: 6 }] },
            createMarker: function () { return null; }
        }).addTo(map);
        alert("Ruta trazada. Puedes arrastrar la línea si necesitas modificarla.");
    }
}

// Allow clicking on the map to add a point exactly there OR set routes
map.on('click', (e) => {
    if (isRouteMode) {
        handleRouteClick(e.latlng);
    } else {
        openModal(e.latlng);
    }
});

// Double click to instantly start a route
map.on('dblclick', (e) => {
    if (!isRouteMode) {
        isRouteMode = true;
        const btn = document.getElementById('btn-route');
        if (btn) btn.style.color = '#ffc107'; // Active visual

        routePoints = [];
        tempRouteMarkers.forEach(m => map.removeLayer(m));
        tempRouteMarkers = [];
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }

        handleRouteClick(e.latlng); // This will set the START point
        alert("📍 Modo Ruta Activado. Has marcado tu punto de INICIO. Ahora selecciona cualquier lugar del mapa con UN CLIC para marcar el destino final.");
    }
});

document.getElementById('btn-add-wp').addEventListener('click', () => {
    openModal(map.getCenter());
});

document.getElementById('btn-cancel').addEventListener('click', () => { modal.classList.add('hidden'); });

// Photo reading + STAMPING (Geospatial watermarking)
wpPhotoInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            const img = new Image();
            img.onload = function () {
                // Create a canvas to stamp the photo
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                // Draw original
                ctx.drawImage(img, 0, 0);

                // STAMPING LOGIC
                const center = map.getCenter();
                const coords = `LAT: ${center.lat.toFixed(5)} LON: ${center.lng.toFixed(5)}`;
                const azimuth = `ORIENTACIÓN: ${currentHeading.toFixed(1)}°`;
                const timestamp = `HORA: ${new Date().toLocaleString()}`;

                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, canvas.height - 80, canvas.width, 80); // Bottom bar

                ctx.font = '24px monospace';
                ctx.fillStyle = '#ffc107'; // Amber
                ctx.fillText(`GEO-STAMP TÁCTICO`, 20, canvas.height - 50);

                ctx.font = '18px monospace';
                ctx.fillStyle = 'white';
                ctx.fillText(`${coords} | ${azimuth}`, 20, canvas.height - 20);
                ctx.textAlign = 'right';
                ctx.fillText(timestamp, canvas.width - 20, canvas.height - 20);

                currentPhotoData = canvas.toDataURL('image/jpeg', 0.8);
                photoPreview.src = currentPhotoData;
                photoPreview.classList.remove('hidden');
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

// Save WP
document.getElementById('btn-save').addEventListener('click', () => {
    const coords = pendingLatLng || map.getCenter();
    const newWP = {
        id: Date.now().toString(),
        lat: coords.lat,
        lng: coords.lng,
        type: wpClassification.value,
        symbology: wpSymbology.value,
        label: wpLabel.value || 'Punto Táctico',
        comment: wpComment.value,
        photo: currentPhotoData
    };
    waypoints.push(newWP);
    renderMarkers();
    modal.classList.add('hidden');
});

// Report Generator Logic
document.getElementById('btn-report').addEventListener('click', () => {
    let reportWindow = window.open('', '_blank');
    let reportHtml = `
        <html>
        <head>
            <title>Informe Táctico de Reconocimiento</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                h1 { color: #1B3B2B; border-bottom: 2px solid #ffc107; padding-bottom: 10px; }
                .waypoint-card { border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px; page-break-inside: avoid; }
                .waypoint-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
                .waypoint-card h3 { margin: 0; color: #d32f2f; }
                .waypoint-card img { max-width: 400px; display: block; margin-top: 15px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.5);}
                @media print { button { display: none; } }
            </style>
        </head>
        <body>
            <button onclick="window.print()" style="padding: 10px; background: #1B3B2B; color: white; float: right;">Imprimir Informe [PDF]</button>
            <h1>Informe Táctico de Terreno - Avanzado</h1>
            <p><strong>Fecha/Hora:</strong> ${new Date().toLocaleString()}</p>
            <div class="waypoints-list">
    `;

    waypoints.forEach(wp => {
        reportHtml += `
            <div class="waypoint-card">
                <div class="waypoint-header">
                    <h3>${wp.label || 'S/N'} (${wp.symbology.toUpperCase()} / ${wp.type.toUpperCase()})</h3>
                    <div>LAT: ${wp.lat.toFixed(6)} | LON: ${wp.lng.toFixed(6)}</div>
                </div>
                ${wp.comment ? `<p><strong>Obs:</strong> ${wp.comment}</p>` : ''}
                ${wp.photo ? `<img src="${wp.photo}">` : '<i>(Sin registro de imagen)</i>'}
            </div>
        `;
    });

    reportHtml += `</div></body></html>`;
    reportWindow.document.write(reportHtml);
    reportWindow.document.close();
});
