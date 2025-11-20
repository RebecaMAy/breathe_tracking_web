/**
 * Archivo: js/dataSimulator.js
 * Propósito: Simular datos y calcular valores basados en proximidad (Interpolación simple).
 */

// --- DATOS DE MAPA DE CALOR (Igual que antes) ---
const simulatedO3Data = [
    [38.9660, -0.1850, 0.40], [38.9675, -0.1815, 0.50],
    [38.9920, -0.1650, 0.90], [38.9880, -0.1700, 0.85],
    [38.9850, -0.1750, 0.75], [38.9550, -0.2000, 0.30],
    [38.9700, -0.1900, 0.60], [38.9600, -0.1950, 0.25],
    [38.9750, -0.1880, 0.45], [38.9500, -0.1800, 0.10],
    [38.9620, -0.1830, 0.60], [38.9690, -0.1780, 0.55],
    [38.9730, -0.1910, 0.35], [38.9800, -0.1600, 0.95]
];

const simulatedCO2Data = [
    [38.9665, -0.1840, 0.95], [38.9655, -0.1820, 0.88],
    [38.9700, -0.1855, 0.70], [38.9720, -0.1750, 0.55],
    [38.9640, -0.1790, 0.65], [38.9900, -0.1680, 0.20],
    [38.9530, -0.1950, 0.35], [38.9800, -0.1720, 0.45],
    [38.9580, -0.1800, 0.15], [38.9780, -0.1800, 0.50]
];

// --- FUNCION MATEMÁTICA PARA "SENTIR" EL MAPA ---
// Calcula la contaminación en un punto específico basándose en la cercanía a las manchas
function calculatePollutionAtLocation(lat, lng, type) {
    let dataSet = (type === 'O3') ? simulatedO3Data : simulatedCO2Data;
    let totalInfluence = 0;
    let count = 0;
    
    // Radio de influencia (aprox 1km en grados lat/lon para esta zona)
    const influenceRadius = 0.015; 

    dataSet.forEach(point => {
        const pLat = point[0];
        const pLng = point[1];
        const intensity = point[2];

        // Distancia euclidiana simple (suficiente para áreas pequeñas)
        const dist = Math.sqrt(Math.pow(lat - pLat, 2) + Math.pow(lng - pLng, 2));

        if (dist < influenceRadius) {
            // Si está dentro del radio, añadimos valor.
            // Cuanto más cerca (dist es pequeño), más valor.
            let weight = 1 - (dist / influenceRadius); 
            totalInfluence += intensity * weight;
            count++;
        }
    });

    // Valor base ambiental (para que nunca sea 0 absoluto)
    let baseValue = 0.15; 
    
    // Si está cerca de muchos puntos, promediamos un poco, pero sumamos base
    let result = baseValue + (count > 0 ? (totalInfluence / Math.max(1, count * 0.5)) : 0);
    
    // Limitar entre 0 y 1
    return Math.min(Math.max(result, 0), 1).toFixed(2);
}


// --- OBTENER DETALLES (AHORA INTELIGENTE) ---
function getPinDetails(lat, lng) {
    // Calculamos los valores reales basados en la posición del pin
    const valO3 = calculatePollutionAtLocation(lat, lng, 'O3');
    // Simulamos radiación y temp algo relacionadas (más calor en centro ciudad)
    
    // Temperatura base 20 + un poco aleatorio
    const valTemp = (20 + (Math.random() * 5) + (valO3 * 5)).toFixed(1); 
    
    // Radiación
    const valRad = (10 + (Math.random() * 10) + (valO3 * 10)).toFixed(0);

    return {
        // Calculamos O3 basado en el mapa
        ozono: valO3, 
        // Datos simulados pero coherentes
        radiacion: valRad,
        temperatura: valTemp,
        ultimasMediciones: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
}

function getContaminantData(type) {
    if (type === 'O3') return simulatedO3Data;
    if (type === 'CO2') return simulatedCO2Data; 
    return [];
}