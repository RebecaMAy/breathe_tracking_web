/**
 * Archivo: js/register_auth.js
 * Propósito: Registrar un nuevo usuario en Firebase Authentication y guardar sus datos en Firestore.
 */

// Importamos directamente desde la CDN oficial de Firebase para evitar dependencias globales.
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// **********************************************
// ⚠ REEMPLAZA ESTO CON LA CONFIGURACIÓN REAL DE TU PROYECTO
// **********************************************
const firebaseConfig = {
    apiKey: "AIzaSyCbAVEYYdtSLmrH_opCM72G_G01QXPRZ48",
    authDomain: "biometria-g3.firebaseapp.com",
    databaseURL: "https://biometria-g3-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "biometria-g3",
    storageBucket: "biometria-g3.firebasestorage.app",
    messagingSenderId: "817957103566",
    appId: "1:817957103566:web:75c78a0a28f3380d092d9f"
};

// Reutilizamos la app si ya existe (evita el error de "Firebase App named '[DEFAULT]' already exists").
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app); // Referencia a Authentication
const db = getFirestore(app); // Referencia a Firestore
// **********************************************
// **********************************************


/**
 * Función auxiliar para validar el FORMATO del email.
 */
function esEmailValido(email) {
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
        
        const eyeOpen = toggle.querySelector('.fas.fa-eye'); 
        const eyeClosed = toggle.querySelector('.fas.fa-eye-slash');

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
    // D) REGISTRO (INTEGRACIÓN CON FIREBASE)
    // ======================================================
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // 1. OBTENER ELEMENTOS
            const nombreCompleto = document.getElementById("nombre").value.trim();
            const email = document.getElementById("correo").value.trim();
            const password = document.getElementById("contrasena").value.trim();
            const repetir = document.getElementById("repetirContrasena").value.trim();
            const codigoPostalInput = document.getElementById("codigoPostal");
            const codigoPostal = codigoPostalInput ? codigoPostalInput.value.trim() : "";
            
            const privacyPolicy = document.getElementById("privacyPolicy");

            const msgEl = document.getElementById("registerMsg");
            const errEl = document.getElementById("registerError");

            // Limpiamos mensajes previos
            if (msgEl) msgEl.textContent = "";
            if (errEl) errEl.textContent = "";

            // --- INICIO DE VALIDACIONES ---
            
            if (!privacyPolicy || !privacyPolicy.checked) {
                if (errEl) errEl.textContent = "Debes aceptar la política de privacidad para registrarte.";
                return;
            }

            if (!esEmailValido(email)) {
                if (errEl) errEl.textContent = "El formato del correo electrónico no es válido.";
                return;
            }

            if (password !== repetir) {
                if (errEl) errEl.textContent = "Las contraseñas no coinciden.";
                return;
            }

            const tieneNumero = /\d/.test(password);
            const tieneMayuscula = /[A-Z]/.test(password);
            const tieneEspecial = /[\W_]/.test(password);
            const tieneLongitud = password.length >= 8; 

            if (!tieneNumero || !tieneMayuscula || !tieneEspecial || !tieneLongitud) {
                let errorMsg = "La contraseña no es segura. Debe contener al menos: ";
                if (!tieneLongitud) errorMsg += "8 caracteres, ";
                if (!tieneNumero) errorMsg += "un número, ";
                if (!tieneMayuscula) errorMsg += "una mayúscula, ";
                if (!tieneEspecial) errorMsg += "un carácter especial, ";
                
                if (errEl) errEl.textContent = errorMsg.slice(0, -2) + ".";
                return;
            }
            
            // --- FIN DE VALIDACIONES ---

            try {
                // 6. PASO 1: Creación del usuario en Firebase Authentication (Acceso directo a la función)
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const userId = user.uid;

                // 7. PASO 2: Guardar datos adicionales en Firestore (Acceso directo a las funciones)
                const nameParts = nombreCompleto.split(' ');
                const nombre = nameParts[0] || '';
                const apellidos = nameParts.slice(1).join(' ') || '';

                await setDoc(doc(db, "Usuarios", userId), {
                    nombre: nombre,
                    apellidos: apellidos,
                    email: email, 
                    cp: codigoPostal, 
                    Id_rol: 'usuario', 
                });

                // 8. ÉXITO
                if (msgEl) msgEl.textContent = "¡Registro completado! Has iniciado sesión.";
                
                // Redirigir al mapa/perfil
                setTimeout(() => window.location.href = "../users_map.html", 1500);

            } catch (error) {
                console.error("Error de Firebase:", error.code, error.message);
                
                let errorMessage;
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = "El correo ya está registrado. Intenta iniciar sesión.";
                        break;
                    case 'auth/invalid-email':
                        errorMessage = "El formato de correo es inválido.";
                        break;
                    default:
                        errorMessage = "Error desconocido al registrar: " + (error.message || error.code);
                        break;
                }
                
                if (errEl) errEl.textContent = errorMessage;
            }
        });
    }

    // ===== Click en el logo → ir al landing (Lógica compartida) =====
    const headerLogo = document.querySelector('.main-header .logo, .logo img, .logo');
    if (headerLogo) {
        headerLogo.style.cursor = 'pointer';
        headerLogo.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }
});