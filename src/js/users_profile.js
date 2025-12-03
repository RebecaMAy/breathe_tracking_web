/**
 * Archivo: js/users_profile.js
 * Propósito: Gestionar la sesión (Auth) y cargar/guardar los datos de perfil (Firestore).
 */
// **********************************************
// 🚨 LINEAS DE FIREBASE ELIMINADAS: initializeApp, getAuth, etc.,
// se accede a ellas globalmente via window (después de la carga en linea en HTML)
// **********************************************

// Módulo local que SÍ necesita import:
import { openModal, closeModal } from "./users_edit.js"; 

const firebaseConfig = {
    apiKey: "AIzaSyCbAVEYYdtSLmrH_opCM72G_G01QXPRZ48",
    authDomain: "biometria-g3.firebaseapp.com",
    databaseURL: "https://biometria-g3-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "biometria-g3",
    storageBucket: "biometria-g3.firebasestorage.app",
    messagingSenderId: "817957103566",
    appId: "1:817957103566:web:75c78a0a28f3380d092d9f"
};

// Inicializar Firebase (acceso directo a las funciones globales)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Referencia global al UID del usuario actual
let currentUserId = null;


document.addEventListener('DOMContentLoaded', function () {
    const statusEl = document.getElementById('status');
    const editForm = document.getElementById('editForm'); // Referencia al formulario del modal

    // 2. Referencias a los elementos del DOM (Vista del perfil)
    const pNombre = document.getElementById('p-nombre');
    const pApellidos = document.getElementById('p-apellidos');
    const pCp = document.getElementById('p-cp'); 
    const pTelefono = document.getElementById('p-telefono');
    const pEmail = document.getElementById('p-email');

    // Inputs del modal de edición
    const editNombre = document.getElementById('edit-nombre');
    const editApellidos = document.getElementById('edit-apellidos');
    const editCp = document.getElementById('edit-cp'); 
    const editTelefono = document.getElementById('edit-telefono');
    const editEmail = document.getElementById('edit-email');

    // Botón de iniciar sesión para ocultarlo
    const loginLink = document.querySelector('.header-nav a[href="login.html"]');

    /** Muestra un mensaje de estado. */
    function showStatus(message, type = 'info') {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.className = 'status-bar show ' + (type ? 'status-' + type : '');
        setTimeout(hideStatus, 5000); // Ocultar después de 5 segundos
    }

    /** Oculta el mensaje de estado. */
    function hideStatus() {
        if (!statusEl) return;
        statusEl.className = 'status-bar';
        statusEl.textContent = '';
    }

    /**
     * Renderiza los datos del perfil en la vista de la página.
     * @param {Object} user - Objeto con los datos del usuario de Firestore.
     */
    function renderProfile(user) {
        if (!user) {
            // Si no hay datos, muestra placeholders o mensaje de error.
            pNombre.textContent = '—';
            pApellidos.textContent = '—';
            pCp.textContent = '—'; 
            pTelefono.textContent = '—';
            pEmail.textContent = '—';
            document.getElementById('p-password').textContent = '••••••••';
            return;
        }
        hideStatus();

        pNombre.textContent = user.nombre || '—';
        pApellidos.textContent = user.apellidos || '—'; 
        pCp.textContent = user.cp || '—'; 
        pTelefono.textContent = user.telefono || '—'; 
        pEmail.textContent = user.email || '—'; 
        document.getElementById('p-password').textContent = '••••••••';
    }
    
    /** Rellena los campos del modal de edición con los datos actuales. */
    function fillEditModal(userData) {
        editNombre.value = userData.nombre || '';
        editApellidos.value = userData.apellidos || '';
        editCp.value = userData.cp || ''; 
        editTelefono.value = userData.telefono || ''; 
        editEmail.value = userData.email || ''; 
    }


    /**
     * Carga los datos del perfil desde Firestore usando el UID del usuario.
     * @param {string} userId - El UID del usuario logueado.
     */
    async function loadUserProfileFromFirestore(userId) {
        currentUserId = userId; // Guarda el UID globalmente
        
        // Uso de 'doc' y 'getDoc' (disponibles globalmente)
        const docRef = doc(db, "usuarios", userId);
        
        try {
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                userData.email = auth.currentUser.email; 

                fillEditModal(userData); // Rellena el modal
                
                return userData; // Retorna los datos para renderProfile
            } else {
                console.warn("Documento de perfil no encontrado para el UID:", userId);
                showStatus('Perfil incompleto. Por favor, completa tus datos.', 'warning');
                return { email: auth.currentUser.email }; // Devuelve solo el email si no hay doc
            }
        } catch (error) {
            console.error("Error al obtener el perfil de Firestore:", error);
            showStatus('Error al cargar el perfil. Por favor, revisa tus Reglas de Seguridad.', 'error');
            return null;
        }
    }


    /** Maneja el envío y actualización del formulario de edición. */
    editForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            nombre: editNombre.value.trim(),
            apellidos: editApellidos.value.trim(),
            cp: editCp.value.trim(), 
            telefono: editTelefono.value.trim(),
        };
        
        if (!currentUserId) {
            showStatus('Error: Usuario no autenticado para actualizar.', 'error');
            return;
        }

        // Uso de 'doc' y 'updateDoc' (disponibles globalmente)
        const docRef = doc(db, "usuarios", currentUserId);
        try {
            showStatus('Guardando cambios...', 'info');
            
            await updateDoc(docRef, {
                nombre: payload.nombre,
                apellidos: payload.apellidos,
                cp: payload.cp, 
                telefono: payload.telefono,
                updated_at: new Date(),
            });
            
            const updatedData = await loadUserProfileFromFirestore(currentUserId);
            renderProfile(updatedData);

            closeModal(); // Cierra el modal después de guardar
            showStatus('¡Perfil actualizado con éxito!', 'success');
            
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            showStatus('Error al guardar: ' + error.message, 'error');
        }
    });


    // 3. Manejador del botón de cerrar sesión (Uso de 'signOut' global)
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
        try {
            await signOut(auth); // Cierra la sesión en Firebase
        } catch (error) {
            showStatus('Error al cerrar sesión: ' + error.message, 'error');
        }
    });


    // 4. PUNTO DE ENTRADA: Monitorear el estado de autenticación (Uso de 'onAuthStateChanged' global)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // USUARIO LOGUEADO
            if (loginLink) loginLink.style.display = 'none';

            const userData = await loadUserProfileFromFirestore(user.uid);
            renderProfile(userData);

        } else {
            // USUARIO NO LOGUEADO
            if (loginLink) loginLink.style.display = 'block'; 
            renderProfile(null); 
            
            showStatus('No hay sesión iniciada. Redirigiendo a login...', 'warning');
            
            setTimeout(() => {
                if (!auth.currentUser) {
                    window.location.href = 'login.html'; 
                }
            }, 1500); 
        }
    });

});