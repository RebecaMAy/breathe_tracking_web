// js/login_auth.js

// URL de la API 
const API_BASE = "https://api-a044.onrender.com";

document.addEventListener('DOMContentLoaded', function() {
    
    // ======================================================
    // A) MOSTRAR / OCULTAR CONTRASEÑA
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
    // B) LOGIN SIMULADO (ADMIN VS USUARIO)
    // ======================================================
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Evitar recarga de página

            const email = document.getElementById("correo").value.trim();
            const password = document.getElementById("contrasena").value.trim();
            
            const msgEl = document.getElementById("loginMsg");
            const errEl = document.getElementById("loginError");

            // Limpiar mensajes previos
            if (msgEl) msgEl.textContent = "";
            if (errEl) errEl.textContent = "";

            // --- INICIO DE LA SIMULACIÓN ---
            // Simulamos un pequeño tiempo de carga (1 segundo) para realismo
            // En un entorno real, esto sería el tiempo que tarda el 'fetch'
            
            /* NOTA: He comentado el fetch real para usar datos "dummy" (falsos)
               según tus credenciales de prueba.
            */

            setTimeout(() => {
                
                // CASO 1: ADMINISTRADOR
                if (email === "admin@breathe.com" && password === "Admin1234!") {
                    
                    // 1. Mostrar éxito
                    if (msgEl) {
                        msgEl.style.color = "green";
                        msgEl.textContent = "Acceso concedido: Administrador";
                    }

                    // 2. Guardar datos falsos en localStorage (para que las otras páginas no fallen)
                    const mockAdminData = {
                        ok: true,
                        user_name: "Admin Jefe",
                        rol_name: "Administrador",
                        Id_Rol: 1, // ID típico de admin
                        token: "fake-token-admin-123"
                    };
                    localStorage.setItem("user", JSON.stringify(mockAdminData));

                    // 3. Redirigir a la pantalla de ADMIN
                    setTimeout(() => {
                        window.location.href = "../admin_sensors.html";
                    }, 1000); // Espera 1 seg extra para leer el mensaje
                }

                // CASO 2: USUARIO REGISTRADO
                else if (email === "usuario@breathe.com" && password === "Usuario1234!") {
                    
                    // 1. Mostrar éxito
                    if (msgEl) {
                        msgEl.style.color = "green";
                        msgEl.textContent = "Acceso concedido: Usuario";
                    }

                    // 2. Guardar datos falsos en localStorage
                    const mockUserData = {
                        ok: true,
                        user_name: "Usuario Estándar",
                        rol_name: "Usuario",
                        Id_Rol: 2, // ID típico de usuario
                        token: "fake-token-user-456"
                    };
                    localStorage.setItem("user", JSON.stringify(mockUserData));

                    // 3. Redirigir a la pantalla de USUARIO
                    setTimeout(() => {
                        window.location.href = "../users_map.html";
                    }, 1000);
                }

                // CASO 3: CREDENCIALES INCORRECTAS
                else {
                    if (errEl) {
                        errEl.textContent = "Correo o contraseña incorrectos.";
                    }
                }

            }, 500); // Tiempo de "carga" simulado del servidor
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