/**
 * Utilidades para el modal de edición de perfil.
 * Se mantienen separadas para poder reutilizarlas desde users_profile.js sin efectos secundarios.
 */

let elementFocusedBeforeModal = null;

const getModal = () => document.getElementById('modal-edit');

const getFieldError = (name) => document.querySelector(`.field-error[data-for="${name}"]`);

export function openModal() {
    const modal = getModal();
    if (!modal) return;
    elementFocusedBeforeModal = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('show');
    const firstInput = modal.querySelector('input:not([disabled]), textarea, select');
    firstInput?.focus();
}

export function closeModal() {
    const modal = getModal();
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('show');
    clearFieldErrors();
    if (elementFocusedBeforeModal) {
        elementFocusedBeforeModal.focus();
        elementFocusedBeforeModal = null;
    }
}

export function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach((el) => {
        el.textContent = '';
        el.classList.remove('show');
    });
}

function showFieldError(name, message) {
    const el = getFieldError(name);
    if (el) {
        el.textContent = message;
        el.classList.add('show');
    }
}

export function validate(values) {
    let ok = true;
    if (!values.nombre || values.nombre.trim().length < 2) {
        showFieldError('nombre', 'El nombre es obligatorio (mínimo 2 caracteres).');
        ok = false;
    }
    if (!values.apellidos || values.apellidos.trim().length < 2) {
        showFieldError('apellidos', 'Los apellidos son obligatorios.');
        ok = false;
    }
    if (values.telefono && values.telefono.trim().length > 0 && !/^[0-9\-\s+()]{6,20}$/.test(values.telefono)) {
        showFieldError('telefono', 'Teléfono no válido.');
        ok = false;
    }
    if (values.cp && values.cp.trim().length > 0 && !/^\d{5}$/.test(values.cp)) {
        showFieldError('cp', 'El Código Postal debe ser de 5 dígitos.');
        ok = false;
    }
    return ok;
}

export default {
    openModal,
    closeModal,
    clearFieldErrors,
    validate,
};