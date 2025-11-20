// src/js/admin_sensors.js

let map;
let markers = [];
const sensorsContainer = document.getElementById('sensors-container');
const activityFilter = document.getElementById('activityFilter');

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderSensorsList(adminSensorsData);

    activityFilter.addEventListener('change', filterSensors);
});

function initMap() {
    map = L.map('admin-map').setView([38.9660, -0.1850], 13); // Centrado en Gandia
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    addSensorMarkers(adminSensorsData);
}

function addSensorMarkers(sensors) {
    // 1. Limpiar marcadores existentes del mapa
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // 2. Añadir nuevos marcadores
    sensors.forEach(sensor => {
        // Determinar estilo del icono (Rojo si hay incidencia)
        const cssClass = sensor.hasIncident ? 'sensor-marker sensor-marker-incident' : 'sensor-marker';
        
        // Crear icono personalizado con HTML (CSS definido en admin_sensors.css)
        const customIcon = L.divIcon({
            className: 'custom-div-icon', // Clase dummy para limpiar estilos default
            html: `<div class="leaflet-marker-icon ${cssClass}"><i class="fas fa-microchip"></i></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker(sensor.coords, { icon: customIcon }).addTo(map);
        
        // Popup simple al hacer clic
        marker.bindPopup(`
            <div style="text-align:center;">
                <b>${sensor.name}</b><br>
                ${sensor.hasIncident ? '<span style="color:red;">⚠ Incidencia detectada</span>' : 'Estado: OK'}
            </div>
        `);

        markers.push(marker);
    });
}

function renderSensorsList(sensors) {
    sensorsContainer.innerHTML = ''; // Limpiar lista

    if (sensors.length === 0) {
        sensorsContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">No se encontraron sensores.</p>';
        return;
    }

    sensors.forEach(sensor => {
        // Crear el elemento HTML de la tarjeta
        const item = document.createElement('div');
        item.className = `sensor-item ${sensor.hasIncident ? 'incident' : ''}`;
        
        item.innerHTML = `
            <div class="sensor-icon">
                <i class="fas fa-broadcast-tower"></i>
            </div>
            <div class="sensor-info">
                <h4>${sensor.name}</h4>
                <p>${sensor.location}</p>
                <p class="last-conn">Última conex: ${sensor.lastConnection}</p>
                ${sensor.hasIncident ? '<p style="color:#ff4d4f; font-weight:bold; font-size:0.8em;">⚠ Fallo de conexión</p>' : ''}
            </div>
            <div class="actions">
                <button class="button-report" onclick="goToDetail('${sensor.id}')">
                    Ver Informe
                </button>
            </div>
        `;

        // Efecto hover: al pasar el ratón por la lista, resaltar marcador en mapa (opcional)
        item.addEventListener('mouseenter', () => {
            // Lógica simple para encontrar marcador por índice (asumiendo orden igual)
            // En producción usarías un ID map.
        });

        sensorsContainer.appendChild(item);
    });
}

// Función de filtrado
function filterSensors() {
    const filterValue = activityFilter.value;
    
    let filteredData = adminSensorsData;

    if (filterValue === 'incident') {
        filteredData = adminSensorsData.filter(s => s.hasIncident === true);
    }

    // Actualizar lista y mapa
    renderSensorsList(filteredData);
    addSensorMarkers(filteredData);
}

// Navegación a detalle
window.goToDetail = function(sensorId) {
    // En una app real pasarías el ID en la URL: admin_sensor_detail.html?id=${sensorId}
    // Para el prototipo vamos directo:
    window.location.href = 'admin_sensor_detail.html';
};