// Find an HTML element using its ID
const $ = id => document.getElementById(id);

// Employee fields that will be sent to the server
const fields = [
  'name',
  'email',
  'department',
  'role',
  'phone',
  'status'
];

// Send requests to the backend API
async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      (data.errors || [data.error || 'Request failed'])
        .join(', ')
    );
  }

  return data;
}

// Display employee records in the table
function renderEmployees(rows) {
  const tbody = $('employeeRows');

  $('totalCount').textContent = rows.length;

  if (rows.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6">No employees found.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(employee => `
    <tr>
      <td>
        EMP-${employee.id} - ${escapeHTML(employee.name)}
      </td>

      <td>${escapeHTML(employee.department)}</td>
      <td>${escapeHTML(employee.role)}</td>
      <td>${escapeHTML(employee.status)}</td>

      <td>
        ${escapeHTML(employee.email)}<br>
        ${escapeHTML(employee.phone)}
      </td>

      <td>
        <button data-edit="${employee.id}">Edit</button>
        <button data-delete="${employee.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  // Connect each Edit button
  tbody.querySelectorAll('[data-edit]').forEach(button => {
    button.addEventListener('click', () => {
      editEmployee(Number(button.dataset.edit));
    });
  });

  // Connect each Delete button
  tbody.querySelectorAll('[data-delete]').forEach(button => {
    button.addEventListener('click', () => {
      deleteEmployee(Number(button.dataset.delete));
    });
  });
}

// Escape text before placing it inside HTML
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

// Retrieve employee data from the server
async function loadEmployees() {
  try {
    const query = $('search').value.trim();

    const url = query
      ? '/api/employees?search=' + encodeURIComponent(query)
      : '/api/employees';

    const rows = await api(url);

    renderEmployees(rows);
  } catch (error) {
    $('employeeRows').innerHTML = `
      <tr>
        <td colspan="6">
          ${escapeHTML(error.message)}
        </td>
      </tr>
    `;
  }
}

// Clear the form for adding a new employee
function clearForm() {
  $('employeeForm').reset();
  $('employeeId').value = '';
  $('formError').textContent = '';
}

// Retrieve one employee and fill the form
async function editEmployee(id) {
  try {
    const employee = await api('/api/employees/' + id);

    $('employeeId').value = employee.id;

    fields.forEach(field => {
      $(field).value = employee[field];
    });

    $('saveBtn').textContent = 'Save Changes';
    $('name').focus();
  } catch (error) {
    alert(error.message);
  }
}

// Delete an employee
async function deleteEmployee(id) {
  const confirmed = confirm(
    'Are you sure you want to delete this employee?'
  );

  if (!confirmed) return;

  try {
    await api('/api/employees/' + id, {
      method: 'DELETE'
    });

    await loadEmployees();
    clearForm();

    alert('Employee deleted successfully.');
  } catch (error) {
    alert(error.message);
  }
}

// Handle form submission for both Create and Update
$('employeeForm').addEventListener('submit', async event => {
  event.preventDefault();

  $('formError').textContent = '';

  // Collect values from the form
  const employee = Object.fromEntries(
    fields.map(field => [
      field,
      $(field).value.trim()
    ])
  );

  // Basic required-field validation
  if (fields.some(field => !employee[field])) {
    $('formError').textContent =
      'Please complete all required fields.';
    return;
  }

  const id = $('employeeId').value;

  // No ID means Create; an ID means Update
  const url = id
    ? '/api/employees/' + id
    : '/api/employees';

  const method = id ? 'PUT' : 'POST';

  try {
    await api(url, {
      method,
      body: JSON.stringify(employee)
    });

    clearForm();
    $('saveBtn').textContent = 'Save Employee';

    await loadEmployees();

    alert(
      id
        ? 'Employee updated successfully.'
        : 'Employee added successfully.'
    );
  } catch (error) {
    $('formError').textContent = error.message;
  }
});

// Search whenever the user types
$('search').addEventListener('input', loadEmployees);

// Cancel editing or clear the form
$('cancelBtn').addEventListener('click', () => {
  clearForm();
  $('saveBtn').textContent = 'Save Employee';
});

// Load employees when the page first opens
loadEmployees();