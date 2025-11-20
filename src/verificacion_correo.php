<?php
// En plesk composer.json en httpdocs
// segun la estructura del proyecto habra que salir x niveles
require '../../vendor/autoload.php';

use Google\Cloud\Firestore\FirestoreClient;
use Google\Cloud\Core\Timestamp;

// ==========================================
// CONFIGURACIÓN DE CREDENCIALES
// ==========================================

// Ruta absoluta de credenciales firebase en Plesk (en mi caso home directory)
$keyFilePath = '/p/vhosts/mrmenaya.upv.edu.es/serviceAccountKey.json';

// ID de tu proyecto Firebase (lo encuentras en la configuración de Firebase o en el propio JSON)
$projectId = 'proyecto-biometria-2025';

// Inicializar Firestore
try {
    if (!file_exists($keyFilePath)) {
        throw new Exception("No se encuentra el archivo de credenciales en: " . $keyFilePath);
    }

    $db = new FirestoreClient([
        'keyFilePath' => $keyFilePath,
        'projectId' => $projectId,
    ]);
} catch (Exception $e) {
    die("Error de conexión con la base de datos.");
    error_log($e->getMessage());
}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Función inversa a base64.urlsafe_b64encode() de Python para decodificar los parámetros
function decodificar_parametro($input) {
    $remainder = strlen($input) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $input .= str_repeat('=', $padlen);
    }
    return base64_decode(strtr($input, '-_', '+/'));
}

// ==========================================
// LÓGICA PRINCIPAL
// ==========================================

// 1. Recibir parámetros de la URL
$p1_hash = $_GET['p1'] ?? '';
$p2_hash = $_GET['p2'] ?? '';

if (empty($p1_hash) || empty($p2_hash)) {
    die("Link inválido: Faltan parámetros.");
}

// 2. Decodificar (De-hashear) el correo y el token
$email = decodificar_parametro($p1_hash);
$token_url = decodificar_parametro($p2_hash);

// 3. Consultar BBDD
try {
    $docRef = $db->collection('usuarios')->document($email);
    $snapshot = $docRef->snapshot();
} catch (Exception $e) {
    die("Error al consultar el usuario.");
}

if (!$snapshot->exists()) {
    die("Enlace no válido o usuario no registrado.");
}

$data = $snapshot->data();
$token_db = $data['token'] ?? null;
// 'validez' es un objeto Timestamp de Google Cloud
$validez_db = $data['validez'] ?? null;
$estado_token = $data['estado_token'] ?? null;

// 4. Validaciones de Seguridad

// A) Validar que el token de la URL coincida con el de la BBDD
if ($token_db !== $token_url) {
    die("Link inválido: El token de seguridad no coincide.");
}

// B) Validar si ya está verificado (Estado 1)
if ($estado_token == 1) {
    echo generar_html_respuesta("¡Ya verificado!", "Tu cuenta ya había sido verificada anteriormente. Puedes iniciar sesión sin problemas.", true);
    exit;
}

// C) Validar la caducidad del token
$ahora = new DateTime();
$fecha_validez_dt = null;

if ($validez_db) {
    // Convertir Timestamp de Firestore a DateTime de PHP
    $fecha_validez_dt = $validez_db->get()->format('Y-m-d H:i:s');
    $fecha_validez_object = new DateTime($fecha_validez_dt);

    if ($ahora > $fecha_validez_object) {
        // --- CASO: TOKEN CADUCADO ---

        // 1. Generar nuevo token y nueva fecha (24h extra)
        $nuevo_token = substr(bin2hex(random_bytes(8)), 0, 16);
        $nueva_validez = new Timestamp(new DateTime('+1 day'));

        // 2. Actualizar en Firestore
        $docRef->update([
            ['path' => 'token', 'value' => $nuevo_token],
            ['path' => 'validez', 'value' => $nueva_validez]
        ]);

        $url_api = 'https://api-envio-correos.onrender.com/email/verificacion';

        $datos_post = json_encode([
            'email' => $email,
            'token' => $nuevo_token
        ]);

        $ch = curl_init($url_api);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $datos_post);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($datos_post)
        ]);

        $respuesta_api = curl_exec($ch);
        $codigo_http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        // ----------------------------------------------------

        // 4. Definir mensaje según el resultado de la API
        if ($codigo_http == 200) {
            $mensaje_usuario = "Este enlace ha caducado. Por seguridad, hemos generado nuevas credenciales y <b>te hemos enviado un nuevo correo automáticamente</b>. Revisa tu bandeja de entrada.";
        } else {
            // Si falla la API (Render dormido, error 500, etc), avisamos para que lo haga manual
            $mensaje_usuario = "Este enlace ha caducado y hemos renovado tus credenciales. Sin embargo, hubo un error al enviarte el correo automáticamente. Por favor, <b>solicita un nuevo envío desde la aplicación</b>.";
        }

        // 5. Informar al usuario
        echo generar_html_respuesta(
            "Enlace caducado",
            $mensaje_usuario,
            false
        );
        exit;
    }
}

// ==========================================
// CASO DE ÉXITO: VERIFICACIÓN COMPLETADA
// ==========================================

// Actualizar estado a verificado (1)
$docRef->update([
    ['path' => 'estado_token', 'value' => 1]
]);

// Mostrar HTML de éxito
echo generar_html_respuesta(
    "¡Cuenta Verificada!",
    "Gracias por confirmar tu correo ($email). <br>Ya tienes acceso completo a Breathe Tracking.",
    true
);


// ==========================================
// FUNCIÓN PARA GENERAR EL HTML (DISEÑO)
// ==========================================
function generar_html_respuesta($titulo, $mensaje, $exito) {
    $color = $exito ? '#28a745' : '#dc3545'; // Verde o Rojo
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
            <a href="https://tudominio.com/login" class="btn">Ir a Iniciar Sesión</a>
        </div>
    </body>
    </html>
HTML;
}
?>
