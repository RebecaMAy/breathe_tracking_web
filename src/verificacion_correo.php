<?php
// ==========================================
// CONFIGURACIÓN API
// ==========================================
$API_BASE_URL = 'https://api-a044.onrender.com';

date_default_timezone_set('UTC');

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Decodificar parámetros URL
function decodificar_parametro($input) {
    return base64_decode(strtr($input, '-_', '+/'));
}


/**
 * Función genérica para hacer llamadas a tu API Python
 */
function llamada_api($metodo, $endpoint, $datos = null) {
    global $API_BASE_URL;
    $url = $API_BASE_URL . $endpoint;

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Configurar método
    if ($metodo !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $metodo);
        if ($datos) {
            $json_datos = json_encode($datos);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json_datos);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Content-Length: ' . strlen($json_datos)
            ]);
        }
    }

    $respuesta = curl_exec($ch);
    $codigo_http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'codigo' => $codigo_http,
        'datos' => json_decode($respuesta, true)['data'] ?? null
    ];
}

// ==========================================
// LÓGICA PRINCIPAL
// ==========================================

// 1. Recibir parámetros
$p1_hash = $_GET['p1'] ?? '';
$p2_hash = $_GET['p2'] ?? '';

if (empty($p1_hash) || empty($p2_hash)) {
    die("Link inválido: Faltan parámetros.");
}

// 2. Decodificar
$email = decodificar_parametro($p1_hash);
$token_url = decodificar_parametro($p2_hash);

// 3. Consultar API para obtener datos del usuario (GET)
// Asumimos que la ruta es /usuario/<email>
$res_usuario = llamada_api('POST', '/usuario', ['email' => $email]);

if ($res_usuario['codigo'] !== 200 || empty($res_usuario['datos'])) {
    die("Enlace no válido o usuario no encontrado en la API." . $email );
}

$data = $res_usuario['datos'];

// Extraer datos (Asegúrate de que tu API devuelve estas claves exactas)
$token_db = $data['token'] ?? null;
$validez_str = $data['validez'] ?? null; // Vendrá como string fecha
$estado_token = $data['estado_token'] ?? null;

// 4. Validaciones de Seguridad

// A) Validar token
if ($token_db !== $token_url) {
    die("Link inválido: El token de seguridad no coincide." . $token_url);
}

// B) Validar si ya está verificado
if ($estado_token == 1) {
    echo generar_html_respuesta("¡Ya verificado!", "Tu cuenta ya había sido verificada anteriormente. Puedes iniciar sesión sin problemas.", true);
    exit;
}

// C) Validar caducidad
$ahora = time();
$fecha_validez_timestamp = $validez_str ? strtotime($validez_str) : 0;

// Si la fecha actual es mayor que la fecha de validez
if ($ahora > $fecha_validez_timestamp) {
    // --- CASO: TOKEN CADUCADO ---

    // 1. Generar nuevos datos
    $nuevo_token = substr(bin2hex(random_bytes(8)), 0, 16);
    // Formato ISO 8601 compatible con Python/Javascript
    $nueva_validez = date('Y-m-d\TH:i:s', strtotime('+1 day'));

    // 2. Actualizar Usuario en la API (PUT)
    $datos_update = [
        'email' => $email,
        'token' => $nuevo_token,
        'validez' => $nueva_validez
    ];

    $res_update = llamada_api('PUT', '/usuario', $datos_update);

    // 3. Enviar correo mediante la API (POST)
    $datos_email = [
        'email' => $email,
        'token' => $nuevo_token
    ];
    $res_email = llamada_api('POST', '/email/verificacion', $datos_email);

    // 4. Definir mensaje
    if ($res_email['codigo'] == 200) {
        $mensaje_usuario = "Este enlace ha caducado. Por seguridad, hemos generado nuevas credenciales y <b>te hemos enviado un nuevo correo automáticamente</b>.";
    } else {
        $mensaje_usuario = "Este enlace ha caducado. Hemos renovado tus credenciales pero hubo un error al enviar el correo. Por favor, <b>solicita un nuevo envío desde la App</b>.";
    }

    echo generar_html_respuesta("Enlace caducado", $mensaje_usuario, false);
    exit;
}

// ==========================================
// CASO DE ÉXITO: VERIFICACIÓN COMPLETADA
// ==========================================

// Actualizar estado a verificado (1) mediante API (PUT)
$datos_confirmacion = [
    'email' => $email,
    'estado_token' => 1
];

$res_confirmacion = llamada_api('PUT', '/usuario', $datos_confirmacion);

if ($res_confirmacion['codigo'] == 200) {
    echo generar_html_respuesta(
        "¡Cuenta Verificada!",
        "Gracias por confirmar tu correo ($email). <br>Ya tienes acceso completo a Breathe Tracking.",
        true
    );
} else {
    echo generar_html_respuesta(
        "Error",
        "El token es correcto, pero hubo un error al actualizar tu estado en el servidor. Intenta de nuevo.",
        false
    );
}


// ==========================================
// FUNCIÓN HTML (SIN CAMBIOS)
// ==========================================
function generar_html_respuesta($titulo, $mensaje, $exito) {
    $color = $exito ? '#28a745' : '#dc3545';
    $icono = $exito ? '✅' : '⚠️';

    return <<<HTML
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{$titulo}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            .card { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; max-width: 90%; width: 400px; }
            h1 { color: #333; margin-bottom: 20px; font-size: 24px; }
            p { color: #666; line-height: 1.6; margin-bottom: 30px; }
            .icon { font-size: 50px; margin-bottom: 20px; display: block; }
            .btn { display: inline-block; padding: 12px 30px; background-color: #0E344C; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; transition: background 0.3s; }
            .btn:hover { background-color: #082233; }
        </style>
    </head>
    <body>
        <div class="card">
            <span class="icon">{$icono}</span>
            <h1 style="color: {$color}">{$titulo}</h1>
            <p>{$mensaje}</p>
            <a href="https://mrmenaya.upv.edu.es/proyecto_biometria/src/auth/login.html" class="btn">Ir a Iniciar Sesión</a>
        </div>
    </body>
    </html>
HTML;
}
?>
