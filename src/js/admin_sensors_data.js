// src/js/admin_sensors_data.js

const adminSensorsData = [
    {
        id: 'ADS133',
        name: 'Sensor ADS133',
        location: 'C/ Gandia, Gandia',
        lastConnection: '14:32',
        hasIncident: false,
        coords: [38.9660, -0.1850]
    },
    {
        id: 'AKMSF134',
        name: 'Sensor AKMSF134',
        location: 'Av. del Cid 8, Gandia',
        lastConnection: '13:23',
        hasIncident: true,
        coords: [38.9700, -0.1800]
    },
    {
        id: 'LMN789',
        name: 'Sensor LMN789',
        location: 'Plaza Mayor 1, Gandia',
        lastConnection: '10:05',
        hasIncident: false,
        coords: [38.9680, -0.1760]
    },
    {
        id: 'XYZ001',
        name: 'Sensor XYZ001',
        location: 'Polígono Industrial, Gandia',
        lastConnection: '09:10',
        hasIncident: true,
        coords: [38.9550, -0.1950]
    },
    {
        id: 'BTH202',
        name: 'Sensor BTH202',
        location: 'Puerto de Gandia, Gandia',
        lastConnection: '15:10',
        hasIncident: false,
        coords: [38.9900, -0.1600]
    }
];

const sensorDetailData = {
    id: 'AKMSF134',
    name: 'Sensor AKMSF134',
    currentLocation: 'C/ Gandia, Gandia',
    avgLocation: 'Av. del Cid 8, Gandia',
    lastConnection: '14:32',
    battery: '20%',
    radio: 29,
    point4: {
        location: 'C/ Acacias, Gandia',
        time: '13:23',
        ozono: 0.3,
        // --- IMPORTANTE: AQUÍ DEBE PONER CO2 ---
        co2: 500, 
        temperatura: 24
    },
    pathCoords: [
        [38.9700, -0.1800], 
        [38.9720, -0.1780],
        [38.9780, -0.1720]
    ]
};