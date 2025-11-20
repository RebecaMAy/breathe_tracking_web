// src/js/admin_sensor_detail.js

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el mapa del punto
    initDetailMap();
    // Cargar datos en el panel izquierdo
    loadSensorData();
});

function initDetailMap() {
    // Obtener posición (usando la última coord como la actual)
    const center = sensorDetailData.pathCoords[sensorDetailData.pathCoords.length - 1];
    
    const map = L.map('detail-map').setView(center, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Icono personalizado del Sensor
    const sensorIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="leaflet-marker-icon sensor-marker" style="background-color: var(--primary-dark-blue); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 1.2em;"><i class="fas fa-microchip"></i></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    const currentMarker = L.marker(center, { icon: sensorIcon, draggable: true }).addTo(map);
    currentMarker.bindPopup(`<b>${sensorDetailData.name}</b><br>Ubicación Actual`).openPopup();
}

function loadSensorData() {
    const data = sensorDetailData;

    // 1. Título
    document.getElementById('sensor-detail-title').textContent = data.name;

    // 2. Ubicación y Estado (IDs corregidos según el nuevo HTML)
    document.getElementById('last-connection-info').innerHTML = `Última conex: <span style="color:#e74c3c">${data.lastConnection}</span>`;
    
    const battElem = document.getElementById('battery-status-text');
    battElem.textContent = `Batería ${data.battery}`;
    
    // Lógica visual de batería
    if(parseInt(data.battery) < 20) {
        battElem.innerHTML += ' <i class="fas fa-battery-quarter" style="color:red"></i>';
    } else {
        battElem.innerHTML += ' <i class="fas fa-battery-three-quarters" style="color:green"></i>';
    }

    document.getElementById('current-location').textContent = data.currentLocation;
    document.getElementById('avg-location').textContent = data.avgLocation;

    // 3. Radio
    const ratioInput = document.querySelector('.block-radio input');
    const ratioVal = document.getElementById('ratio-value');
    ratioInput.value = data.radio;
    ratioVal.textContent = data.radio + 'km';

    // 4. Mediciones
    document.getElementById('point-location-text').textContent = data.point4.location;
    document.getElementById('point-time').textContent = `Hora: ${data.point4.time}`;

    const ozonoInput = document.querySelectorAll('.block-point-4 input')[0];
    const radInput = document.querySelectorAll('.block-point-4 input')[1];
    const tempInput = document.querySelectorAll('.block-point-4 input')[2];

    ozonoInput.value = data.point4.ozono;
    document.getElementById('ozono-value').textContent = data.point4.ozono + 'ppm';

    radInput.value = data.point4.radiacion;
    document.getElementById('radiacion-value').textContent = data.point4.radiacion + 'MHz';

    tempInput.value = data.point4.temperatura;
    document.getElementById('temperatura-value').textContent = data.point4.temperatura + '°C';
}