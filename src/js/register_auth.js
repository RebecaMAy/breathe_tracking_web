// js/register_auth.js

// 1)  URL DE LA API
const API_BASE = "https://api-a044.onrender.com";

/**
 * Función auxiliar para validar el FORMATO del email.
 * Esto no comprueba si el email existe, solo si parece un email.
 * @param {string} email - El correo a validar.
 * @returns {boolean} - true si el formato es válido.
 */
function esEmailValido(email) {
    // Expresión regular simple para validar el formato de email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

document.addEventListener('DOMContentLoaded', function() {
    // ======================================================
    // A) MOSTRAR / OCULTAR CONTRASEÑA (Lógica compartida)
    // ======================================================
    const toggles = document.querySelectorAll('.toggle-password');
    toggles.forEach((toggle) => {
        const wrapper = toggle.closest('.password-input-wrapper');
        if (!wrapper) return;
        const passwordInput = wrapper.querySelector('input[type="password"], input[type="text"]');
        const eyeOpen = toggle.querySelector('#eye-open');
        const eyeClosed = toggle.querySelector('#eye-closed');

        if (passwordInput && eyeOpen && eyeClosed) {
            toggle.addEventListener('click', function() {
                const isPassword = passwordInput.getAttribute('type') === 'password';
                passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
                if (isPassword) {
                    eyeOpen.style.display = 'none';
                    eyeClosed.style.display = 'inline-block';
                } else {
                    eyeOpen.style.display = 'inline-block';
                    eyeClosed.style.display = 'none';
                }
            });
        }
    });

    // ======================================================
    // D) REGISTRO (CON VALIDACIONES DE SEGURIDAD)
    // ======================================================
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            // Prevenimos el envío automático del formulario
            e.preventDefault();

            // 1. OBTENER ELEMENTOS
            const nombre = document.getElementById("nombre").value.trim();
            const email = document.getElementById("correo").value.trim();
            const password = document.getElementById("contrasena").value.trim();
            const repetir = document.getElementById("repetirContrasena").value.trim();
            const codigoPostalInput = document.getElementById("codigoPostal");
            const codigoPostal = codigoPostalInput ? codigoPostalInput.value.trim() : "";
            
            // Casilla de política de privacidad
            // Asegúrate de tener en tu HTML un input así: <input type="checkbox" id="privacyPolicy">
            const privacyPolicy = document.getElementById("privacyPolicy");

            // Elementos para mostrar mensajes al usuario
            const msgEl = document.getElementById("registerMsg");
            const errEl = document.getElementById("registerError");

            // Limpiamos mensajes previos
            if (msgEl) msgEl.textContent = "";
            if (errEl) errEl.textContent = "";

            // --- INICIO DE VALIDACIONES (FRONT-END) ---

            // 2. VALIDACIÓN: Ley de protección de datos
            // Comprobamos que la casilla de privacidad esté marcada.
            if (!privacyPolicy || !privacyPolicy.checked) {
                if (errEl) errEl.textContent = "Debes aceptar la política de privacidad para registrarte.";
                return; // Detenemos la ejecución
            }

            // 3. VALIDACIÓN: Formato de correo electrónico
            // Usamos la función auxiliar de arriba
            if (!esEmailValido(email)) {
                if (errEl) errEl.textContent = "El formato del correo electrónico no es válido.";
                return; // Detenemos la ejecución
            }

            // 4. VALIDACIÓN: Doble verificación de contraseña
            // Esto ya lo tenías. Comprueba que ambas contraseñas coinciden.
            if (password !== repetir) {
                if (errEl) errEl.textContent = "Las contraseñas no coinciden.";
                return; // Detenemos la ejecución
            }

            // 5. VALIDACIÓN: Contraseña segura
            // Comprobamos las reglas de la imagen: número, mayúscula, carácter especial.
            // Añadimos también una longitud mínima (8 caracteres) como buena práctica.
            const tieneNumero = /\d/.test(password);
            const tieneMayuscula = /[A-Z]/.test(password);
            const tieneEspecial = /[\W_]/.test(password); // \W es "no-palabra" (especial), _ se añade por si acaso.
            const tieneLongitud = password.length >= 8;

            if (!tieneNumero || !tieneMayuscula || !tieneEspecial || !tieneLongitud) {
                let errorMsg = "La contraseña no es segura. Debe contener al menos: ";
                if (!tieneLongitud) errorMsg += "8 caracteres, ";
                if (!tieneNumero) errorMsg += "un número, ";
                if (!tieneMayuscula) errorMsg += "una mayúscula, ";
                if (!tieneEspecial) errorMsg += "un carácter especial, ";
                
                // Quitamos la última coma y espacio
                if (errEl) errEl.textContent = errorMsg.slice(0, -2) + ".";
                return; // Detenemos la ejecución
            }

            // --- FIN DE VALIDACIONES (FRONT-END) ---

            // Si todas las validaciones del front-end pasan, intentamos enviar al back-end.
            try {
                // 6. PUNTO CLAVE: Contraseña Codificada (TAREA DEL BACK-END)
                // Enviamos la contraseña en "texto plano" (tal cual la escribió el usuario).
                // La conexión HTTPS (la 's' de https://) la encripta DURANTE EL VIAJE.
                // El SERVIDOR (back-end) es quien DEBE recibirla y "codificarla" (hashearla)
                // usando un algoritmo seguro (como bcrypt) ANTES de guardarla en la BD.
                //
                // ¡NUNCA HAGAS HASH DE LA CONTRASEÑA EN EL FRONT-END!

                const res = await fetch(`${API_BASE}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nombre: nombre,
                        email: email,
                        password: password, // Se envía en plano, el back-end la hashea
                        codigo_postal: codigoPostal
                    })
                });

                const data = await res.json();

                // Si la API nos devuelve un error (ej. email ya existe)
                if (!res.ok || !data.ok) {
                    if (errEl) errEl.textContent = data.error || "No se pudo registrar. Inténtalo de nuevo.";
                    return;
                }

                // 7.  VALIDACIÓN: Verificación de correo electrónico (TAREA DEL BACK-END)
                // El back-end debería haber enviado un email de verificación.
                // Por lo tanto, actualizamos el mensaje de éxito para reflejar esto.
                if (msgEl) msgEl.textContent = "¡Registro completado! Revisa tu correo para verificar tu cuenta.";

                // Opcional: Redirigir al login después de unos segundos
                // setTimeout(() => window.location.href = "./login.html", 3000);

            } catch (err) {
                // Error de red (ej. no se puede conectar con la API)
                console.error(err);
                if (errEl) errEl.textContent = "No se pudo conectar con el servidor. Revisa tu conexión.";
            }
        });
    }

    // ===== Click en el logo → ir al landing (Lógica compartida) =====
    // (Esta parte no se modifica, sigue igual)
    const headerLogo = document.querySelector('.main-header .logo, .logo img, .logo');
    if (headerLogo) {
        headerLogo.style.cursor = 'pointer';
        headerLogo.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }
});