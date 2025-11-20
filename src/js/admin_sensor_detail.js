// src/js/admin_sensor_detail.js

document.addEventListener('DOMContentLoaded', () => {
    initDetailMap();
    loadSensorData();
});

function initDetailMap() {
    // Obtener posición
    const center = sensorDetailData.pathCoords[sensorDetailData.pathCoords.length - 1];
    
    const map = L.map('detail-map').setView(center, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Icono personalizado
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

    // 2. Ubicación y Estado
    const lastConnInfo = document.getElementById('last-connection-info');
    if(lastConnInfo) {
        lastConnInfo.innerHTML = `Última conex: <span style="color:#e74c3c">${data.lastConnection}</span>`;
    }
    
    const battElem = document.getElementById('battery-status-text');
    if(battElem) {
        battElem.textContent = `Batería ${data.battery}`;
        if(parseInt(data.battery) < 20) {
            battElem.innerHTML += ' <i class="fas fa-battery-quarter" style="color:red"></i>';
        } else {
            battElem.innerHTML += ' <i class="fas fa-battery-three-quarters" style="color:green"></i>';
        }
    }

    const curLoc = document.getElementById('current-location');
    if(curLoc) curLoc.textContent = data.currentLocation;
    
    const avgLoc = document.getElementById('avg-location');
    if(avgLoc) avgLoc.textContent = data.avgLocation;

    // --- AQUÍ ESTABA EL ERROR: Se ha eliminado toda referencia al RADIO ---

    // 3. Mediciones (Ahora funciona porque el script no se rompe antes)
    const pLoc = document.getElementById('point-location-text');
    if(pLoc) pLoc.textContent = data.point4.location;
    
    const pTime = document.getElementById('point-time');
    if(pTime) pTime.textContent = `Hora: ${data.point4.time}`;

    // Seleccionamos los inputs del bloque de mediciones
    const inputs = document.querySelectorAll('.block-point-4 input');
    
    if(inputs.length >= 3) {
        const ozonoInput = inputs[0];
        const co2Input = inputs[1];
        const tempInput = inputs[2];

        // Ozono
        ozonoInput.value = data.point4.ozono;
        const ozonoVal = document.getElementById('ozono-value');
        if(ozonoVal) ozonoVal.textContent = data.point4.ozono + 'ppm';

        // CO2
        co2Input.value = data.point4.co2;
        const co2Val = document.getElementById('co2-value');
        if(co2Val) co2Val.textContent = data.point4.co2 + 'ppm';

        // Temperatura
        tempInput.value = data.point4.temperatura;
        const tempVal = document.getElementById('temperatura-value');
        if(tempVal) tempVal.textContent = data.point4.temperatura + '°C';
    }
}