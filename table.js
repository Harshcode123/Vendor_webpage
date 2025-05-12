// Global variables
let allTableData = [];
const dropdownSheetName = "Dropdown"; // Name of your dropdown sheet
const mainSheetName = "Vendor"; // Name of your main data sheet

// Configuration for sheet access
const sheetConfig = {
  id: '16dH0QCUyKd5fpM_0P4riOgF3n8COrhruSN0HbXau3pI',
  apiKey: 'AIzaSyBlha6kRb9lO7g3Id1wcD96QFYmQS7Kwow'
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadDropdownValues().then(() => {
    loadTableData(); // Load main table data after dropdowns are populated
  });
});

// Function to load dropdown values from Dropdown sheet
async function loadDropdownValues() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetConfig.id}/values/${dropdownSheetName}?key=${sheetConfig.apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const rows = data.values;
    
    // Skip header row if exists
    const startRow = rows[0][0] === 'Category' ? 1 : 0;
    
    // Process each dropdown
    const categoryFilter = document.getElementById('categoryFilter');
    const vendorTypeFilter = document.getElementById('vendorTypeFilter');
    const locationFilter = document.getElementById('locationFilter');
    
    const categories = new Set();
    const vendorTypes = new Set();
    const locations = new Set();
    
    for (let i = startRow; i < rows.length; i++) {
      if (rows[i][0]) categories.add(rows[i][0]); // Column A - Category
      if (rows[i][1]) vendorTypes.add(rows[i][1]); // Column B - Vendor Type
      if (rows[i][2]) locations.add(rows[i][2]);   // Column C - Location
    }
    
    // Populate dropdowns
    populateDropdown(categoryFilter, Array.from(categories).sort());
    populateDropdown(vendorTypeFilter, Array.from(vendorTypes).sort());
    populateDropdown(locationFilter, Array.from(locations).sort());
    
  } catch (error) {
    console.error('Error loading dropdown values:', error);
  }
}

// Helper function to populate dropdown
function populateDropdown(selectElement, options) {
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option;
    selectElement.appendChild(optionElement);
  });
}

// Function to load main table data
async function loadTableData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetConfig.id}/values/${mainSheetName}?key=${sheetConfig.apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const rows = data.values;

    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    allTableData = [];

    // Skip header row if exists
    const startRow = rows[0][0] === 'Timestamp' ? 1 : 0;

    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i];
      allTableData.push(row);

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 transition-colors';
      tr.innerHTML = `
        <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${formatDate(row[0])}</td>
        <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${row[1] || ''}</td>
        <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${row[2] || ''}</td>
        <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${row[3] || ''}</td>
        <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${row[4] || ''}</td>
        <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">
          <button class="edit-btn px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" data-rowid="${i - startRow}">
            Edit
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    }

    // Add event listeners for edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const rowId = this.getAttribute('data-rowid');
        editVendor(rowId);
      });
    });

    // Add event listeners for dropdown filters
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('vendorTypeFilter').addEventListener('change', applyFilters);
    document.getElementById('locationFilter').addEventListener('change', applyFilters);

  } catch (error) {
    console.error('Error loading table data:', error);
  }
}

// Function to handle edit action
async function editVendor(rowId) {
  try {
    // Get the vendor data
    const vendorData = allTableData[rowId];
    
    // Store the row ID in session storage
    sessionStorage.setItem('editRowId', rowId);
    sessionStorage.setItem('editRowData', JSON.stringify(vendorData));
    
    // Redirect to form page
    window.location.href = 'form.html?edit=true';

  } catch (error) {
    console.error('Error loading edit form:', error);
    alert('Error loading form for editing');
  }
}

// Function to apply filters
function applyFilters() {
  const categoryValue = document.getElementById('categoryFilter').value;
  const vendorTypeValue = document.getElementById('vendorTypeFilter').value;
  const locationValue = document.getElementById('locationFilter').value;

  const filteredData = allTableData.filter(row => {
    const rowCategory = row[1] || ''; // Vendor Name as category
    const rowVendorType = row[8] || ''; // Vehicle Types as vendor type
    const rowLocation = row[2] || ''; // Office Location as location

    return (!categoryValue || rowCategory.includes(categoryValue)) &&
           (!vendorTypeValue || rowVendorType.includes(vendorTypeValue)) &&
           (!locationValue || rowLocation.includes(locationValue));
  });

  renderTable(filteredData);
}

function renderTable(data) {
  const tableBody = document.getElementById('table-body');
  tableBody.innerHTML = '';

  data.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 transition-colors';
    tr.innerHTML = `
      <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${formatDate(row[0])}</td>
      <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${row[1] || ''}</td>
      <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${row[2] || ''}</td>
      <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${row[3] || ''}</td>
      <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${row[4] || ''}</td>
      <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">
        <button class="edit-btn px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" data-rowid="${index}">
          Edit
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
    
    // Add event listener to the new edit button
    tr.querySelector('.edit-btn').addEventListener('click', function() {
      editVendor(this.getAttribute('data-rowid'));
    });
  });
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString(); // Format based on user's locale
}