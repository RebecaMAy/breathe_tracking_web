/**
 * Autor: Javier Rupérez
 * Descripción: Simulación de datos de perfil de usuario y manejo de sesión.
 * Fecha: 2025
 */

/**
 * Archivo: js/users_profile.js
 * Propósito: Simular datos de perfil de usuario y manejo de sesión.
 */
document.addEventListener('DOMContentLoaded', function () {
  const statusEl = document.getElementById('status');
  
  /** Muestra un mensaje de estado solo si el elemento existe */
  function showStatus(message, type = 'info') {
    // Verificación de existencia para evitar el TypeError
    if (!statusEl) {
        console.warn('Elemento de estado (id="status") no encontrado en el DOM.');
        return;
    }
    statusEl.textContent = message;
    statusEl.className = 'status-bar show' + (type ? ' status-' + type : '');
  }

  /** Oculta el mensaje de estado solo si el elemento existe */
  function hideStatus() {
    if (!statusEl) return;
    statusEl.className = 'status-bar';
    statusEl.textContent = '';
  }
  
  /**
   * Renderiza los datos del perfil en el DOM.
   * @param {Object} user - Objeto con los datos del usuario.
   */
  function renderProfile(user) {
    // Si no hay usuario, mantiene los placeholders y muestra un mensaje
    if (!user) {
      showStatus('No hay sesión iniciada. Inicia sesión para ver tu perfil.', 'empty');
      return;
    }
    hideStatus();

    // Prioriza las claves más comunes
    const nombre = user.nombre ?? user.name ?? user.firstName ?? document.getElementById('p-nombre').textContent;
    const apellidos = user.apellidos ?? user.apellido ?? user.lastName ?? document.getElementById('p-apellidos').textContent;
    const telefono = user.telefono ?? user.phone ?? user.telefono_movil ?? document.getElementById('p-telefono').textContent;
    const email = user.email ?? user.correo ?? document.getElementById('p-email').textContent;
    
    // Asignación de valores al DOM
    document.getElementById('p-nombre').textContent = nombre || '—';
    document.getElementById('p-apellidos').textContent = apellidos || '—';
    document.getElementById('p-telefono').textContent = telefono || '—';
    document.getElementById('p-email').textContent = email || '—';
    // Mantiene la visualización enmascarada para la contraseña
    document.getElementById('p-password').textContent = '••••••••';
  }

  /** Carga los datos del usuario desde localStorage */
  function loadProfileFromStorage() {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Intenta obtener el objeto de usuario si está envuelto (data.user, data.usuario)
      const user = data.user || data.usuario || data;
      return user;
    } catch (_) { 
      // Si falla el parseo, se limpia localStorage para evitar problemas futuros
      localStorage.removeItem('user');
      return null; 
    }
  }

  // Manejador del botón de cerrar sesión
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem('user');
    showStatus('Sesión cerrada. Serás redirigido al inicio…');
    setTimeout(() => window.location.href = '../index.html', 800);
  });
  
  // Carga y renderiza el perfil al cargar la página
  renderProfile(loadProfileFromStorage());
});