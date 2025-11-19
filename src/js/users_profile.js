document.addEventListener('DOMContentLoaded', function () {
  const statusEl = document.getElementById('status');
  function showStatus(message, type = 'info') {
    statusEl.textContent = message;
    statusEl.className = 'status-bar show' + (type ? ' status-' + type : '');
  }

  function hideStatus() {
    statusEl.className = 'status-bar';
    statusEl.textContent = '';
  }
  function mapRol(value) {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value === 1 ? 'Administrador' : value === 2 ? 'Suscriptor' : String(value);
    return String(value);
  }

  function renderProfile(user) {
    // If no user, keep placeholders and show hint
    if (!user) {
      showStatus('No hay sesión iniciada. Inicia sesión para ver tu perfil.', 'empty');
      return;
    }
    hideStatus();

    const nombre = user.nombre ?? user.name ?? user.firstName ?? document.getElementById('p-nombre').textContent;
    const apellidos = user.apellidos ?? user.apellido ?? user.lastName ?? document.getElementById('p-apellidos').textContent;
    const telefono = user.telefono ?? user.phone ?? user.telefono_movil ?? document.getElementById('p-telefono').textContent;
    const email = user.email ?? user.correo ?? document.getElementById('p-email').textContent;
    // We should NOT display raw passwords; show masked value if provided by the backend flag
    const passwordVisible = false; // intentionally false for security

    document.getElementById('p-nombre').textContent = nombre || '—';
    document.getElementById('p-apellidos').textContent = apellidos || '—';
    document.getElementById('p-telefono').textContent = telefono || '—';
    document.getElementById('p-email').textContent = email || '—';
    document.getElementById('p-password').textContent = passwordVisible && user.password ? user.password : '••••••••';
  }

  function loadProfileFromStorage() {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Algunas APIs devuelven los datos envueltos, intentamos varias claves
      const user = data.user || data.usuario || data;
      return user;
    } catch (_) { return null; }
  }

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem('user');
    showStatus('Sesión cerrada. Serás redirigido al inicio…');
    setTimeout(() => window.location.href = '../index.html', 800);
  });

  renderProfile(loadProfileFromStorage());
});
