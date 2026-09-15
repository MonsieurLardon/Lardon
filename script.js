const STORAGE_KEY = 'testEntrepriseClients';

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
    notes: 'Disponible le matin.'
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
    notes: 'Maison avec portail.'
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
    notes: 'A déjà acheté il y a 2 mois.'
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

let clients = loadClients();

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

  document.querySelector('.panel h2').textContent = 'Modifier le client';
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.textContent = 'Enregistrer les modifications';
}

function resetForm() {
  clientForm.reset();
  document.getElementById('clientId').value = '';
  document.querySelector('.panel h2').textContent = 'Ajouter / Modifier un client';
  document.getElementById('submitBtn').textContent = 'Ajouter le client';
}

clientForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const id = document.getElementById('clientId').value;
  const formData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    age: Number(document.getElementById('age').value),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    status: document.getElementById('status').value,
    notes: document.getElementById('notes').value.trim()
  };

  if (!formData.firstName || !formData.lastName || !formData.address || !formData.city) {
    alert('Merci de remplir au minimum le nom, prénom, adresse et ville.');
    return;
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
    saveClients();
    render();
    resetForm();
  }
});

searchInput.addEventListener('input', renderTable);

resetBtn.addEventListener('click', () => {
  const confirmed = window.confirm('Voulez-vous vraiment supprimer toute la base de données locale ?');
  if (!confirmed) return;

  clients = [];
  saveClients();
  render();
  resetForm();
});

cancelEditBtn.addEventListener('click', resetForm);

function render() {
  renderStats();
  renderTable();
}

render();
