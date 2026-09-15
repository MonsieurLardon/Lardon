const STORAGE_KEY = 'testEntrepriseClients';
const AUTH_KEY = 'testEntrepriseAuth';

const defaultClients = [
  {
    id: 1,
    firstName: 'Jean',
    lastName: 'Martin',
    age: 42,
    address: '12 rue des Lilas',
    city: 'Lyon',
    phone: '06 12 34 56 78',
    email: 'jean.martin@example.com',
    status: 'À relancer',
    notes: 'Disponible le matin.',
    photo: ''
  },
  {
    id: 2,
    firstName: 'Sophie',
    lastName: 'Lemoine',
    age: 35,
    address: '8 avenue du Parc',
    city: 'Saint-Étienne',
    phone: '07 45 32 18 90',
    email: 'sophie.lemoine@example.com',
    status: 'Rdv fixé',
    notes: 'Maison avec portail.',
    photo: ''
  },
  {
    id: 3,
    firstName: 'Luc',
    lastName: 'Dubois',
    age: 29,
    address: '45 chemin des Charmes',
    city: 'Grenoble',
    phone: '06 88 77 66 55',
    email: 'luc.dubois@example.com',
    status: 'Client',
    notes: 'A déjà acheté il y a 2 mois.',
    photo: ''
  }
];

const clientForm = document.getElementById('clientForm');
const clientTableBody = document.getElementById('clientTableBody');
const searchInput = document.getElementById('searchInput');
const totalClientsEl = document.getElementById('totalClients');
const activeStatusEl = document.getElementById('activeStatus');
const clientAgeEl = document.getElementById('clientAge');
const resetBtn = document.getElementById('resetBtn');
const cancelEditBtn = document.getElementById('cancelEdit');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');
const logoutBtn = document.getElementById('logoutBtn');
const clientDossier = document.getElementById('clientDossier');
const photoInput = document.getElementById('photo');

let clients = loadClients();
let selectedClientId = null;

function loadClients() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultClients));
    return [...defaultClients];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultClients];
  } catch (error) {
    return [...defaultClients];
  }
}

function saveClients() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

function getClientById(id) {
  return clients.find((client) => client.id === Number(id));
}

function formatStatus(status) {
  const classes = {
    'Client': 'status-client',
    'Rdv fixé': 'status-rdv',
    'À relancer': 'status-relancer',
    'Refusé': 'status-refuse'
  };

  return `<span class="status-pill ${classes[status] || ''}">${status}</span>`;
}

function buildPlaceholderAvatar(firstName, lastName) {
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" fill="#eaf3ff"/>
      <circle cx="60" cy="42" r="22" fill="#ffb067"/>
      <path d="M28 96c8-16 25-24 32-24s24 8 32 24" fill="#1d78d9"/>
      <text x="60" y="110" text-anchor="middle" font-size="22" font-family="Arial, sans-serif" fill="#0f4fa8" font-weight="700">${initials}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getClientPhotoURL(client) {
  return client.photo || buildPlaceholderAvatar(client.firstName, client.lastName);
}

function renderStats() {
  const total = clients.length;
  const active = clients.filter((client) => client.status === 'Client' || client.status === 'Rdv fixé').length;
  const averageAge = total
    ? Math.round(clients.reduce((sum, client) => sum + Number(client.age || 0), 0) / total)
    : 0;

  totalClientsEl.textContent = total;
  activeStatusEl.textContent = active;
  clientAgeEl.textContent = `${averageAge} ans`;
}

function renderDossier() {
  if (!selectedClientId) {
    clientDossier.innerHTML = '<p>Sélectionnez un client pour ouvrir son dossier.</p>';
    return;
  }

  const client = getClientById(selectedClientId);

  if (!client) {
    clientDossier.innerHTML = '<p>Ce client n’existe plus.</p>';
    return;
  }

  clientDossier.innerHTML = `
    <div class="dossier-header">
      <img src="${getClientPhotoURL(client)}" alt="Photo de ${client.firstName} ${client.lastName}" class="client-avatar">
      <div>
        <h3>${client.firstName} ${client.lastName}</h3>
        <p>${formatStatus(client.status)}</p>
      </div>
    </div>

    <div class="dossier-grid">
      <div class="dossier-box">
        <span class="label-dossier">Âge</span>
        <strong>${client.age || 'Non renseigné'} ans</strong>
      </div>
      <div class="dossier-box">
        <span class="label-dossier">Ville</span>
        <strong>${client.city || 'Non renseignée'}</strong>
      </div>
      <div class="dossier-box full-width">
        <span class="label-dossier">Adresse</span>
        <strong>${client.address || 'Non renseignée'}</strong>
      </div>
      <div class="dossier-box">
        <span class="label-dossier">Téléphone</span>
        <strong>${client.phone || 'Non renseigné'}</strong>
      </div>
      <div class="dossier-box">
        <span class="label-dossier">Email</span>
        <strong>${client.email || 'Non renseigné'}</strong>
      </div>
      <div class="dossier-box full-width">
        <span class="label-dossier">Notes</span>
        <strong>${client.notes || 'Aucune note'}</strong>
      </div>
    </div>
  `;
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const filteredClients = clients.filter((client) => {
    const values = [
      client.firstName,
      client.lastName,
      client.address,
      client.city,
      client.phone,
      client.email,
      client.status
    ].join(' ').toLowerCase();

    return values.includes(query);
  });

  if (!filteredClients.length) {
    clientTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">Aucun client trouvé.</td>
      </tr>
    `;
    return;
  }

  clientTableBody.innerHTML = filteredClients
    .map(
      (client) => `
        <tr>
          <td>${client.lastName}</td>
          <td>${client.firstName}</td>
          <td>${client.age}</td>
          <td>${client.address}</td>
          <td>${client.city}</td>
          <td>${client.phone}</td>
          <td>${formatStatus(client.status)}</td>
          <td>
            <div class="row-actions">
              <button class="btn-small dossier-btn" data-id="${client.id}">Dossier</button>
              <button class="btn-small edit-btn" data-id="${client.id}">Modifier</button>
              <button class="btn-small delete-btn" data-id="${client.id}">Supprimer</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');
}

function fillForm(client) {
  document.getElementById('clientId').value = client.id;
  document.getElementById('firstName').value = client.firstName;
  document.getElementById('lastName').value = client.lastName;
  document.getElementById('age').value = client.age;
  document.getElementById('address').value = client.address;
  document.getElementById('city').value = client.city;
  document.getElementById('phone').value = client.phone;
  document.getElementById('email').value = client.email;
  document.getElementById('status').value = client.status;
  document.getElementById('notes').value = client.notes || '';

  const formTitle = document.querySelector('.panel h2');
  if (formTitle) formTitle.textContent = 'Modifier le client';

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.textContent = 'Enregistrer les modifications';
}

function resetForm() {
  clientForm.reset();
  photoInput.value = '';
  document.getElementById('clientId').value = '';

  const formTitle = document.querySelector('.panel h2');
  if (formTitle) formTitle.textContent = 'Ajouter / Modifier un client';

  document.getElementById('submitBtn').textContent = 'Ajouter le client';
}

function showApp() {
  loginScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
}

function showLogin() {
  appScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username === 'Enzo' && password === 'azerty') {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ isLoggedIn: true, username }));
    loginError.textContent = '';
    showApp();
    return;
  }

  loginError.textContent = 'Identifiant ou mot de passe incorrect.';
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(AUTH_KEY);
  showLogin();
  loginForm.reset();
  loginError.textContent = '';
});

clientForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('clientId').value;
  const file = photoInput.files[0];

  const formData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    age: Number(document.getElementById('age').value),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    status: document.getElementById('status').value,
    notes: document.getElementById('notes').value.trim(),
    photo: ''
  };

  if (!formData.firstName || !formData.lastName || !formData.address || !formData.city) {
    alert('Merci de remplir au minimum le nom, prénom, adresse et ville.');
    return;
  }

  if (file) {
    try {
      formData.photo = await readFileAsDataURL(file);
    } catch (error) {
      alert('La photo n’a pas pu être chargée.');
      return;
    }
  } else if (id) {
    const existingClient = getClientById(id);
    formData.photo = existingClient ? existingClient.photo || '' : '';
  }

  if (id) {
    clients = clients.map((client) =>
      client.id === Number(id) ? { ...client, ...formData } : client
    );
  } else {
    const newClient = {
      id: Date.now(),
      ...formData
    };
    clients.unshift(newClient);
  }

  saveClients();
  render();
  resetForm();
});

clientTableBody.addEventListener('click', (event) => {
  const target = event.target;

  if (target.classList.contains('dossier-btn')) {
    selectedClientId = Number(target.dataset.id);
    renderDossier();
    return;
  }

  if (target.classList.contains('edit-btn')) {
    const clientId = Number(target.dataset.id);
    const client = getClientById(clientId);
    if (client) fillForm(client);
    return;
  }

  if (target.classList.contains('delete-btn')) {
    const clientId = Number(target.dataset.id);
    const client = getClientById(clientId);

    if (!client) return;

    const confirmed = window.confirm(`Supprimer ${client.firstName} ${client.lastName} ?`);
    if (!confirmed) return;

    clients = clients.filter((item) => item.id !== clientId);
    if (selectedClientId === clientId) selectedClientId = null;
    saveClients();
    render();
    resetForm();
  }
});

searchInput.addEventListener('input', renderTable);
cancelEditBtn.addEventListener('click', resetForm);

resetBtn.addEventListener('click', () => {
  const confirmed = window.confirm('Voulez-vous vraiment supprimer toute la base de données locale ?');
  if (!confirmed) return;

  clients = [];
  selectedClientId = null;
  saveClients();
  render();
  resetForm();
});

function render() {
  renderStats();
  renderTable();
  renderDossier();
}

const hasSession = localStorage.getItem(AUTH_KEY);
if (hasSession) {
  try {
    const session = JSON.parse(hasSession);
    if (session && session.isLoggedIn) {
      showApp();
    } else {
      showLogin();
    }
  } catch (error) {
    showLogin();
  }
} else {
  showLogin();
}

render();
