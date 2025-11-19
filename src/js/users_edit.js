import { FIREBASE_CONFIG } from './firebase_config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// users_edit.js: module that manages the Edit Profile modal, validation and saving
const modal = document.getElementById('modal-edit');
const form = document.getElementById('editForm');
const btnEdit = document.getElementById('btn-edit');
const btnCancel = document.getElementById('edit-cancel');

let firestore = null;
let firebaseApp = null;

function initFirebaseIfConfigured() {
  try {
    if (FIREBASE_CONFIG && Object.keys(FIREBASE_CONFIG).length) {
      firebaseApp = initializeApp(FIREBASE_CONFIG);
      firestore = getFirestore(firebaseApp);
      return true;
    }
  } catch (err) {
    console.warn('Firebase init failed:', err);
  }
  return false;
}

function openModal() {
  // populate with current DOM values
  document.getElementById('edit-nombre').value = document.getElementById('p-nombre').textContent || '';
  document.getElementById('edit-apellidos').value = document.getElementById('p-apellidos').textContent || '';
  document.getElementById('edit-telefono').value = document.getElementById('p-telefono').textContent || '';
  document.getElementById('edit-email').value = document.getElementById('p-email').textContent || '';

  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('show');
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('show');
  clearFieldErrors();
}

function showFieldError(name, message) {
  const el = document.querySelector(`.field-error[data-for="${name}"]`);
  if (el) { el.textContent = message; el.classList.add('show'); }
}
function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach(e => { e.textContent=''; e.classList.remove('show'); });
}

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
  if (values.telefono && !/^[0-9\-\s+()]{6,20}$/.test(values.telefono)) {
    showFieldError('telefono','Teléfono no válido.'); ok = false;
  }
  return ok;
}

async function saveToFirestore(uid, payload) {
  if (!firestore) throw new Error('Firestore no inicializado');
  const docRef = doc(firestore, 'users', String(uid));
  await setDoc(docRef, payload, { merge: true });
}

function saveToLocalStorage(userObj) {
  // try to merge with existing localStorage.user
  try {
    const raw = localStorage.getItem('user');
    if (!raw) { localStorage.setItem('user', JSON.stringify(userObj)); return; }
    const existing = JSON.parse(raw);
    const merged = { ...existing, ...userObj };
    localStorage.setItem('user', JSON.stringify(merged));
  } catch (e) {
    localStorage.setItem('user', JSON.stringify(userObj));
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  const values = {
    nombre: document.getElementById('edit-nombre').value.trim(),
    apellidos: document.getElementById('edit-apellidos').value.trim(),
    telefono: document.getElementById('edit-telefono').value.trim(),
    email: document.getElementById('edit-email').value.trim(),
  };

  if (!validate(values)) return;

  // prepare payload
  const payload = {
    nombre: values.nombre,
    apellidos: values.apellidos,
    telefono: values.telefono,
    email: values.email,
    updated_at: new Date().toISOString()
  };

  // determine user id from localStorage if any
  const raw = localStorage.getItem('user');
  let uid = null;
  try { if (raw) { const d = JSON.parse(raw); uid = d.id_usuario ?? d.id ?? d.userId ?? d.email ?? null; } } catch(e){}

  // try save to firebase if configured
  const firebaseOk = initFirebaseIfConfigured();
  try {
    if (firebaseOk && uid) {
      // use uid (or email) as doc id
      const docId = String(uid).replace(/[@.]/g,'_');
      await saveToFirestore(docId, payload);
    } else {
      // fallback: update localStorage
      const userObj = { ...(raw ? JSON.parse(raw) : {}), ...payload };
      saveToLocalStorage(userObj);
    }

    // update DOM values
    document.getElementById('p-nombre').textContent = payload.nombre;
    document.getElementById('p-apellidos').textContent = payload.apellidos;
    document.getElementById('p-telefono').textContent = payload.telefono;
    document.getElementById('p-email').textContent = payload.email;

    closeModal();
    // small success feedback
    const status = document.getElementById('status');
    if (status) { status.textContent = 'Perfil actualizado.'; status.className='status-bar show'; setTimeout(()=>{ status.className='status-bar'; status.textContent=''; }, 2200); }
  } catch (err) {
    console.error('Save profile failed', err);
    showFieldError('email','No se pudo guardar. Revisa la conexión.');
  }
}

// wire events
btnEdit?.addEventListener('click', openModal);
btnCancel?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
form?.addEventListener('submit', handleSubmit);

// export for debugging/tests
export { openModal, closeModal, validate };
