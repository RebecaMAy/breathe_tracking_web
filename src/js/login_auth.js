/**
 * Archivo: js/login_auth.js
 * Propósito: Autenticar al usuario con Firebase y redirigir.
 */

// 1. Importaciones de Firebase SDK
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
// Inicializar Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app); // Referencia a Authentication
const db = getFirestore(app); // Referencia a Firestore
// **********************************************
// **********************************************

// Función auxiliar para obtener datos del perfil (incluyendo el rol)
async function fetchUserProfile(userId) {
    const docRef = doc(db, "Usuarios", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const userData = docSnap.data();
        // 🚨 CAMBIO: Mapeamos Id_rol a la variable 'rol' para la lógica de redirección
        return {
            ...userData,
            rol: userData.Id_rol || 'usuario' 
        };
    }
    return { rol: 'usuario' }; 
}

document.addEventListener('DOMContentLoaded', function() {
    
    // ======================================================
    // A) MOSTRAR / OCULTAR CONTRASEÑA
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
    // B) LOGIN CON FIREBASE AUTH
    // ======================================================
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault(); 

            const email = document.getElementById("correo").value.trim();
            const password = document.getElementById("contrasena").value.trim();
            
            const msgEl = document.getElementById("loginMsg");
            const errEl = document.getElementById("loginError");

            // Limpiar mensajes previos
            if (msgEl) msgEl.textContent = "";
            if (errEl) errEl.textContent = "";
            
            try {
                // 1. Iniciar sesión en Firebase Authentication
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // 2. Obtener datos de Firestore para verificar el rol (Id_rol)
                const profile = await fetchUserProfile(user.uid);
                const userRole = profile.rol || 'usuario'; 

                // 3. Mostrar éxito
                if (msgEl) {
                    msgEl.style.color = "green";
                    msgEl.textContent = `Acceso concedido: ${userRole.toUpperCase()}`;
                }

                // 4. Redirigir según el rol
                setTimeout(() => {
                    // Nota: Asume que el rol 'administrador' o 'admin' redirige a admin_sensors
                    if (userRole === 'administrador' || userRole === 'admin') {
                        window.location.href = "../admin_sensors.html";
                    } else {
                        // Rol por defecto o 'usuario' redirige al mapa
                        window.location.href = "../users_map.html";
                    }
                }, 1000); 

            } catch (error) {
                console.error("Error de Firebase:", error.code, error.message);
                
                let errorMessage;
                switch (error.code) {
                    case 'auth/invalid-email':
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        errorMessage = "Correo o contraseña incorrectos.";
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = "Acceso bloqueado temporalmente por demasiados intentos.";
                        break;
                    default:
                        errorMessage = "Error de inicio de sesión. Inténtalo de nuevo.";
                        break;
                }
                
                if (errEl) errEl.textContent = errorMessage;
            }
        });
    }

    // ===== Click en el logo → ir al landing =====
    const headerLogo = document.querySelector('.main-header .logo');
    if (headerLogo) {
        headerLogo.style.cursor = 'pointer';
        headerLogo.addEventListener('click', () => {
            window.location.href = '../index.html'; 
        });
    }

});