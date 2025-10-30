// js/auth.js

// 1)  AQUÍ CAMBIAR A LA URL DE LA API (Render)
const API_BASE = "https://api-a044.onrender.com";
// ej. cuando ella lo suba: 

document.addEventListener('DOMContentLoaded', function() {
    // ======================================================
    // A) MOSTRAR / OCULTAR CONTRASEÑA (tu código original)
    // ======================================================

    // ojo: en login hay 1 contraseña, en registro también,
    // así que lo hacemos para todas las .toggle-password que haya
    const toggles = document.querySelectorAll('.toggle-password');

    toggles.forEach((toggle) => {
        // buscamos el input de password que está en el mismo "password-input-wrapper"
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
                    // mostrar icono de "cerrar ojo"
                    eyeOpen.style.display = 'none';
                    eyeClosed.style.display = 'inline-block';
                } else {
                    // mostrar icono de "ojo abierto"
                    eyeOpen.style.display = 'inline-block';
                    eyeClosed.style.display = 'none';
                }
            });
        }
    });

    // ======================================================
    // B) FUNCIÓN AUXILIAR PARA DETECTAR ROL QUE DEVUELVE LA API
    // ======================================================
    function detectarRol(data) {
        // si la API devuelve el nombre directamente
        if (data.rol_name) return data.rol_name;
        if (data.rol) return data.rol;

        // si la API devuelve el id del rol, como en tu tabla ("Id_Rol")
        if (data.Id_Rol !== undefined && data.Id_Rol !== null) {
            // ⚠️ AJUSTA ESTOS IDs cuando sepáis los reales
            // Ejemplo típico:
            if (data.Id_Rol === 1) return "Administrador";
            if (data.Id_Rol === 2) return "Usuario";
            // si es otro número lo tratamos como usuario normal
            return "Usuario";
        }

        // por defecto
        return "Usuario";
    }

    // ======================================================
    // C) LOGIN
    // ======================================================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // tus IDs originales del login
            const email = document.getElementById("correo").value.trim();
            const password = document.getElementById("contrasena").value.trim();
            const msgEl = document.getElementById("loginMsg");
            const errEl = document.getElementById("loginError");

            // limpiar mensajes
            if (msgEl) msgEl.textContent = "";
            if (errEl) errEl.textContent = "";

            try {
                const res = await fetch(`${API_BASE}/login`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const data = await res.json();

                // si la API dice que no ok
                if (!res.ok || !data.ok) {
                    if (errEl) errEl.textContent = data.error || "Error al iniciar sesión";
                    return;
                }

                // detectamos el rol que venga de la API
                const rol = detectarRol(data);

                if (msgEl) {
                    if (rol === "Administrador") {
                        msgEl.textContent = "✅ Login como ADMIN completado";
                    } else {
                        msgEl.textContent = "✅ Login como usuario registrado completado";
                    }
                }

                // guardar en localStorage por si luego quieres usarlo
                localStorage.setItem("user", JSON.stringify(data));

                // opcional: redirigir
                // setTimeout(() => window.location.href = "../index.html", 1500);

            } catch (err) {
                console.error(err);
                if (errEl) errEl.textContent = "No se pudo conectar con el servidor";
            }
        });
    }

    // ======================================================
    // D) REGISTRO
    // ======================================================
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // IDs tal cual los tienes en registro.html
            const nombre = document.getElementById("nombre").value.trim();
            const email = document.getElementById("correo").value.trim();
            const password = document.getElementById("contrasena").value.trim();
            const repetir = document.getElementById("repetirContrasena").value.trim();
            const codigoPostalInput = document.getElementById("codigoPostal");
            const codigoPostal = codigoPostalInput ? codigoPostalInput.value.trim() : "";

            const msgEl = document.getElementById("registerMsg");
            const errEl = document.getElementById("registerError");

            if (msgEl) msgEl.textContent = "";
            if (errEl) errEl.textContent = "";

            // validación simple de contraseñas
            if (password !== repetir) {
                if (errEl) errEl.textContent = "Las contraseñas no coinciden";
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nombre: nombre,
                        email: email,
                        password: password,
                        codigo_postal: codigoPostal
                        // el rol NO lo mandamos porque lo decidís vosotros en la API
                    })
                });

                const data = await res.json();

                if (!res.ok || !data.ok) {
                    if (errEl) errEl.textContent = data.error || "No se pudo registrar";
                    return;
                }

                // éxito
                if (msgEl) msgEl.textContent = "✅ Registro completado. Ahora inicia sesión.";

                // opcional: redirigir
                // setTimeout(() => window.location.href = "./login.html", 1500);

            } catch (err) {
                console.error(err);
                if (errEl) errEl.textContent = "No se pudo conectar con el servidor";
            }
        });
    }

    // ===== Click en el logo → ir al landing =====
    const headerLogo = document.querySelector('.main-header .logo, .logo img, .logo');
    if (headerLogo) {
        headerLogo.style.cursor = 'pointer';
        headerLogo.addEventListener('click', () => {
            // si tu landing es index.html en la raíz:
            window.location.href = '../index.html';  // <- usa './index.html' si estás en la raíz
        });
    }


});


