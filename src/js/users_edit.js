/**
 * Autor: Javier Rupérez
 * Descripción: Módulo que maneja el modal de Edición de Perfil de forma simulada.
 * Fecha: 2025
 */

/**
 * Archivo: js/users_edit.js
 * Propósito: Módulo que maneja el modal de Edición de Perfil de forma simulada.
 */
const modal = document.getElementById('modal-edit');
const form = document.getElementById('editForm');
const btnEdit = document.getElementById('btn-edit');
const btnCancel = document.getElementById('edit-cancel');
const statusEl = document.getElementById('status'); // Referencia al elemento de estado global

// Solución de Accesibilidad: Almacena el elemento que tenía el foco antes de abrir el modal
let elementFocusedBeforeModal = null; 

/** Abre el modal de edición y precarga los datos actuales. */
function openModal() {
    // Guarda el elemento que tenía el foco antes de abrir el modal (generalmente btnEdit)
    elementFocusedBeforeModal = document.activeElement;

    // 1. Precarga los campos del modal con los valores actuales del DOM
    document.getElementById('edit-nombre').value = document.getElementById('p-nombre').textContent.trim() || '';
    document.getElementById('edit-apellidos').value = document.getElementById('p-apellidos').textContent.trim() || '';
    
    // Campo Código Postal (cp)
    const cpValue = document.getElementById('p-cp').textContent.trim();
    document.getElementById('edit-cp').value = (cpValue === '—' ? '' : cpValue) || '';
    
    // Campo Teléfono
    const telefonoValue = document.getElementById('p-telefono').textContent.trim();
    document.getElementById('edit-telefono').value = (telefonoValue === '—' ? '' : telefonoValue) || '';
    
    document.getElementById('edit-email').value = document.getElementById('p-email').textContent.trim() || '';

    // 2. Muestra el modal
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('show');
    
    // 3. Mueve el foco al primer campo del formulario para accesibilidad
    document.getElementById('edit-nombre').focus(); 
}

/** Cierra el modal de edición. */
function closeModal() {
    // 1. Oculta el modal
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('show');
    clearFieldErrors();
    
    // 2. Devuelve el foco al elemento que lo tenía antes (el botón 'Editar')
    if (elementFocusedBeforeModal) {
        elementFocusedBeforeModal.focus();
        elementFocusedBeforeModal = null; // Limpia la referencia
    }
}

/** Muestra un error bajo un campo específico. */
function showFieldError(name, message) {
    const el = document.querySelector(`.field-error[data-for="${name}"]`);
    if (el) { el.textContent = message; el.classList.add('show'); }
}

/** Limpia todos los mensajes de error de los campos. */
function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(e => { e.textContent=''; e.classList.remove('show'); });
}

/** 🚨 Mantiene la función sin efecto visual en la página. */
function showPageStatus(message, type = 'info') {
    return;
}

/** Valida los campos del formulario. */
function validate(values) {
    clearFieldErrors();
    let ok = true;
    
    if (!values.nombre || values.nombre.trim().length < 2) {
        showFieldError('nombre','El nombre es obligatorio (mínimo 2 caracteres).'); ok = false;
    }
    if (!values.apellidos || values.apellidos.trim().length < 2) {
        showFieldError('apellidos','Los apellidos son obligatorios.'); ok = false;
    }
    if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        showFieldError('email','Email no válido.'); ok = false;
    }
    // Permite que el teléfono sea opcional
    if (values.telefono && values.telefono.trim().length > 0 && !/^[0-9\-\s+()]{6,20}$/.test(values.telefono)) {
        showFieldError('telefono','Teléfono no válido.'); ok = false;
    }
    // Validación de Código Postal (opcional, 5 dígitos)
    if (values.cp && values.cp.trim().length > 0 && !/^\d{5}$/.test(values.cp)) {
        showFieldError('cp','El Código Postal debe ser de 5 dígitos.'); ok = false;
    }
    
    return ok;
}

/** Guarda o actualiza los datos del usuario en localStorage. */
function saveToLocalStorage(payload) {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) { 
            localStorage.setItem('user', JSON.stringify(payload)); 
            return; 
        }
        
        let existingData = JSON.parse(raw);
        let existingUser = existingData.user || existingData.usuario || existingData;
        
        const mergedUser = { ...existingUser, ...payload };
        
        if (existingData.user) {
            existingData.user = mergedUser;
        } else if (existingData.usuario) {
            existingData.usuario = mergedUser;
        } else {
            existingData = mergedUser;
        }

        localStorage.setItem('user', JSON.stringify(existingData));
    } catch (e) {
        console.error('Error al guardar en localStorage:', e);
        localStorage.setItem('user', JSON.stringify(payload)); 
    }
}

/** Maneja el envío del formulario de edición. */
async function handleSubmit(e) {
    e.preventDefault();
    
    // 1. Obtiene los valores del formulario
    const values = {
        nombre: document.getElementById('edit-nombre').value.trim(),
        apellidos: document.getElementById('edit-apellidos').value.trim(),
        cp: document.getElementById('edit-cp').value.trim(), 
        telefono: document.getElementById('edit-telefono').value.trim(),
        email: document.getElementById('edit-email').value.trim(),
    };

    // 2. Valida los datos
    if (!validate(values)) return;

    // 3. Prepara el objeto de datos a guardar (payload)
    const payload = {
        nombre: values.nombre,
        apellidos: values.apellidos,
        cp: values.cp, 
        telefono: values.telefono,
        email: values.email, 
        updated_at: new Date().toISOString()
    };

    // 4. Guarda la simulación localmente
    try {
        saveToLocalStorage(payload);

        // 5. Actualiza los valores mostrados en el DOM del perfil
        document.getElementById('p-nombre').textContent = payload.nombre;
        document.getElementById('p-apellidos').textContent = payload.apellidos;
        document.getElementById('p-cp').textContent = payload.cp || '—'; 
        document.getElementById('p-telefono').textContent = payload.telefono || '—';
        document.getElementById('p-email').textContent = payload.email;

        // 6. Cierra el modal. 
        closeModal();
        showPageStatus('Perfil actualizado (simulación local).', 'success'); 
    } catch (err) {
        console.error('Save profile failed', err);
    }
}

// 7. Conexión de eventos
btnEdit?.addEventListener('click', openModal);
btnCancel?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => { 
    if (e.target === modal) closeModal(); 
});
form?.addEventListener('submit', handleSubmit);

// export for debugging/tests
export { openModal, closeModal, validate };