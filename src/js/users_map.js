/**
 * Autor: Marc Vilagrosa
 * Descripción: Lógica principal del mapa, gestión de pines con Modal, interacción con capas de calor y renderizado de vistas.
 * Fecha: 2025
 */

/**
 * Archivo: js/users_map.js
 * Propósito: Lógica principal del mapa, gestión de pines con Modal y datos inteligentes.
 */

// --- CONFIGURACIÓN INICIAL DEL MAPA ---
const INITIAL_CENTER = [38.9667, -0.1833]; // Centro de Gandia
const INITIAL_ZOOM = 14; 

// Inicializar el mapa
const map = L.map('mapa').setView(INITIAL_CENTER, INITIAL_ZOOM);

// Añadir la capa de fondo (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// --- VARIABLES GLOBALES ---
let activeHeatLayer = null; // Capa de calor actual
let currentPins = [];       // Array de pines
let pinIdCounter = 0;       // IDs únicos
let isAddingPin = false;    // Estado: ¿Añadiendo pin?
let selectedPinId = null;   // ID seleccionado
let tempLatLng = null;      // Coordenadas temporales para el Modal

// --- ELEMENTOS DEL DOM ---
// Botones y Paneles
const addPinButton = document.getElementById('add-pin-btn');
const movePinButton = document.getElementById('move-pin-btn');
const pinsContainer = document.getElementById('pins-container');
const pinListView = document.getElementById('pin-list-view');
const pinDetailView = document.getElementById('pin-detail-view');
const selectorContaminante = document.getElementById('selectorContaminante');
const mapContainer = document.getElementById('mapa');
const deletePinButton = document.getElementById('delete-pin-btn');

// Elementos del Modal
const modalName = document.getElementById('name-pin-modal');
const inputPinName = document.getElementById('new-pin-name-input');
const btnConfirmAdd = document.getElementById('confirm-add-btn');
const btnCancelAdd = document.getElementById('cancel-add-btn');

// Elementos del Panel de Detalle
const detailTitle = document.getElementById('detail-pin-title');
const detailAddress = document.getElementById('detail-direccion');
const detailRatio = document.getElementById('detail-ratio');
const detailTime = document.getElementById('detail-ultimas-mediciones');
const sliderOzono = document.getElementById('ozono-slider');
const valueOzono = document.getElementById('ozono-value');
const sliderRad = document.getElementById('radiacion-slider');
const valueRad = document.getElementById('radiacion-value');
const sliderTemp = document.getElementById('temperatura-slider');
const valueTemp = document.getElementById('temperatura-value');
const activityTypeSpan = document.getElementById('activity-contaminant-type');


// --- 1. GESTIÓN DEL MAPA DE CALOR ---

/**
 * mapa: String (Tipo) -> updateHeatmap() -> Void
 */
function updateHeatmap(contaminantType) {
    // Remover capa anterior
    if (activeHeatLayer) {
        map.removeLayer(activeHeatLayer);
    }

    // Obtener datos simulados
    const dataPoints = getContaminantData(contaminantType);
    
    // --- AJUSTES PARA INTERPOLACIÓN VISUAL ---
    // radius: Cuanto más alto, más área cubre cada punto y más se mezclan entre sí.
    // blur: Cuanto más alto, más suave es el degradado (sin bordes duros).
    let gradientConfig;
    let radiusValue = 80; // 80 conecta los puntos mejor
    let blurValue = 60;   // 60 suaviza la mezcla

    if (contaminantType === 'O3') {
        // Ozono: Degradado suave de Azul (limpio) a Rojo (sucio)
        gradientConfig = {
            0.2: 'blue',
            0.4: 'cyan',
            0.6: 'lime',
            0.8: 'yellow',
            1.0: 'red'
        }; 
    } else if (contaminantType === 'CO2') {
        // CO2: Degradado de Verde a Naranja Oscuro
        gradientConfig = {
            0.2: 'green', 
            0.5: 'yellow', 
            1.0: 'orange'
        };
    }

    // Dibujar capa con los nuevos parámetros de interpolación
    if (dataPoints.length > 0) {
        activeHeatLayer = L.heatLayer(dataPoints, {
            radius: radiusValue, 
            blur: blurValue,
            maxZoom: 13, // Bajamos el maxZoom para que al alejar se vea más sólido
            gradient: gradientConfig,
            minOpacity: 0.3 // Añade un poco de opacidad base para que no queden huecos blancos feos
        }).addTo(map);
    }
    
    // Actualizar texto
    activityTypeSpan.textContent = contaminantType === 'O3' ? 'Ozono' : 'Dióxido de Carbono';
    
    // Refrescar datos del pin seleccionado si existe
    if (selectedPinId) {
        const pinObj = currentPins.find(p => p.id === selectedPinId);
        if (pinObj) selectPin(selectedPinId);
    }
}


// --- 2. GESTIÓN DE PINES (FLUJO CON MODAL) ---

// A. Click en botón "Añadir Pin"
addPinButton.addEventListener('click', () => {
    isAddingPin = !isAddingPin; 
    
    if (isAddingPin) {
        // Cambiar estilo botón a Cancelar
        addPinButton.style.backgroundColor = '#e74c3c'; 
        addPinButton.innerHTML = '<i class="fas fa-times"></i> Cancelar';
        mapContainer.style.cursor = 'crosshair'; 
        
        // Activar listener en el mapa
        map.on('click', onMapClickForPin); 
    } else {
        resetAddPinMode();
    }
});

/**
 * UI: Void -> resetAddPinMode() -> Void
 */
function resetAddPinMode() {
    isAddingPin = false;
    addPinButton.style.backgroundColor = ''; // Color original
    addPinButton.innerHTML = '<i class="fas fa-map-marker-alt"></i> Añadir Pin';
    mapContainer.style.cursor = ''; 
    map.off('click', onMapClickForPin); 
}

// B. Click en el Mapa -> ABRE MODAL
/**
 * Evento: MouseEvent -> onMapClickForPin() -> Void
 */
function onMapClickForPin(e) {
    tempLatLng = e.latlng; // Guardar coordenadas temporalmente
    
    // Mostrar modal y enfocar input
    modalName.style.display = 'flex';
    inputPinName.value = ''; 
    inputPinName.focus();
}

// C. Confirmar en el Modal -> CREA PIN
btnConfirmAdd.addEventListener('click', () => {
    // Si no escribe nombre, poner uno por defecto
    const name = inputPinName.value.trim() || `Punto ${pinIdCounter + 1}`;
    
    addCustomPin(tempLatLng, name); // Crear el pin
    
    modalName.style.display = 'none'; // Cerrar modal
    resetAddPinMode(); // Salir del modo añadir
});

// D. Cancelar en el Modal
btnCancelAdd.addEventListener('click', () => {
    modalName.style.display = 'none';
});


// --- FUNCIÓN PRINCIPAL PARA CREAR EL OBJETO PIN ---

/**
 * lógica: Object (LatLng), String -> addCustomPin() -> Void
 */
function addCustomPin(latlng, customName) {
    pinIdCounter++;
    const newPinId = `pin-${pinIdCounter}`;
    
    const newPin = {
        id: newPinId,
        lat: latlng.lat,
        lng: latlng.lng,
        name: customName,
        address: `Lat: ${latlng.lat.toFixed(4)}, Lon: ${latlng.lng.toFixed(4)}`, 
        marker: null
    };

    // Crear marcador Leaflet
    const marker = L.marker(latlng).addTo(map);
    
    // Click en el marcador -> Seleccionar Pin
    marker.on('click', () => {
        selectPin(newPinId);
    });
    
    newPin.marker = marker;
    currentPins.push(newPin);

    // Actualizar lista y seleccionar el nuevo
    renderPinsList();
    selectPin(newPinId); 
}

// Renderizar la lista lateral
/**
 * UI: Void -> renderPinsList() -> HTML Element
 */
function renderPinsList() {
    pinsContainer.innerHTML = ''; 
    
    currentPins.forEach(pin => {
        const pinDiv = document.createElement('div');
        pinDiv.classList.add('pin-item');
        if (selectedPinId === pin.id) pinDiv.classList.add('selected');
        
        pinDiv.innerHTML = `
            <i class="fas fa-map-marker-alt pin-icon"></i>
            <div class="pin-info">
                <h4>${pin.name}</h4>
                <p>${pin.address}</p>
            </div>
            
        `;

        pinDiv.addEventListener('click', () => selectPin(pin.id));
        pinsContainer.appendChild(pinDiv);
    });
}


// --- 3. VISTA DE DETALLES Y DATOS INTELIGENTES ---

/**
 * lógica: String (ID) -> selectPin() -> Void
 */
function selectPin(pinId) {
    selectedPinId = pinId;
    const pinObj = currentPins.find(p => p.id === pinId);
    
    if (!pinObj) return;

    // 1. Centrar mapa y abrir popup
    map.setView([pinObj.lat, pinObj.lng], 16);
    
    // 2. OBTENER DATOS INTELIGENTES (dataSimulator.js)
    // Pasamos las coordenadas para que calcule la contaminación real ahí
    const details = getPinDetails(pinObj.lat, pinObj.lng);

    // 3. Rellenar UI
    detailTitle.innerText = pinObj.name;
    detailAddress.innerText = pinObj.address;
    detailRatio.innerText = '1.2 km'; // Estático por ahora
    detailTime.innerText = details.ultimasMediciones;

    // Sliders
    sliderOzono.value = details.ozono;
    valueOzono.innerText = details.ozono + ' ppm';
    
    // Colorear texto según peligro
    if(details.ozono > 0.7) valueOzono.style.color = '#e74c3c'; // Rojo
    else if(details.ozono > 0.4) valueOzono.style.color = '#f39c12'; // Naranja
    else valueOzono.style.color = '#27ae60'; // Verde

    sliderRad.value = details.radiacion;
    valueRad.innerText = details.radiacion + ' MHz';

    sliderTemp.value = details.temperatura;
    valueTemp.innerText = details.temperatura + ' °C';

    // 4. Cambiar Vista
    pinListView.style.display = 'none';
    pinDetailView.style.display = 'block';
    movePinButton.style.display = 'block'; // Mostrar botón mover
    
    // Actualizar highlight en la lista
    renderPinsList();
}

// Volver a la lista (Llamado desde el HTML onclick)
/**
 * UI: Void -> showPinListView() -> Void
 */
function showPinListView() {
    pinListView.style.display = 'block';
    pinDetailView.style.display = 'none';
    movePinButton.style.display = 'none';
    
    selectedPinId = null;
    map.closePopup();
    renderPinsList();
}


// --- 4. MOVER PIN ---
let isMovingPin = false;

movePinButton.addEventListener('click', () => {
    const pinObj = currentPins.find(p => p.id === selectedPinId);
    if (!pinObj) return;

    isMovingPin = !isMovingPin;

    if (isMovingPin) {
        movePinButton.innerHTML = '<i class="fas fa-check"></i> Confirmar Posición';
        movePinButton.style.backgroundColor = '#27ae60'; // Verde
        
        // Hacer draggable
        pinObj.marker.dragging.enable();
        pinObj.marker.setOpacity(0.7);
        
    } else {
        movePinButton.innerHTML = '<i class="fas fa-hand-rock"></i> Mover Pin';
        movePinButton.style.backgroundColor = ''; 

        // Guardar nueva pos
        const newPos = pinObj.marker.getLatLng();
        pinObj.lat = newPos.lat;
        pinObj.lng = newPos.lng;
        
        pinObj.marker.dragging.disable();
        pinObj.marker.setOpacity(1);

        // Actualizar dirección visual y recalcular datos
        pinObj.address = `Lat: ${newPos.lat.toFixed(4)}, Lon: ${newPos.lng.toFixed(4)}`;
        selectPin(selectedPinId); // Refrescar datos con nueva posición
    }
});

// --- 5. ZOOM MANUAL ---
document.getElementById('zoom-in-btn').addEventListener('click', () => map.zoomIn());
document.getElementById('zoom-out-btn').addEventListener('click', () => map.zoomOut());

// --- LÓGICA PARA ELIMINAR PIN ---
deletePinButton.addEventListener('click', () => {
    // 1. Verificar si hay un pin seleccionado
    if (!selectedPinId) return;

    // 2. Buscar el índice del pin en el array
    const pinIndex = currentPins.findIndex(p => p.id === selectedPinId);

    if (pinIndex !== -1) {
        // 3. Quitar el marcador del mapa
        map.removeLayer(currentPins[pinIndex].marker);

        // 4. Eliminar el objeto del array
        currentPins.splice(pinIndex, 1);

        // 5. Volver a la lista y actualizarla
        showPinListView();
        renderPinsList();
    }
});

// --- INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    updateHeatmap('O3'); // Cargar Ozono por defecto
    
    // Pines de ejemplo iniciales
    addCustomPin({lat: 38.9660, lng: -0.1850}, "Estación Centro");
    addCustomPin({lat: 38.9700, lng: -0.1800}, "Punto Norte");
    
    showPinListView();
});