// Global variables
let allTableData = [];
const dropdownSheetName = "Dropdown"; // Name of your dropdown sheet
const mainSheetName = "Vendor"; // Name of your main data sheet

// Configuration for which columns to use for each dropdown
const dropdownConfig = {
  categoryFilter: { column: 0 }, // Column A in Dropdown sheet
  vendorTypeFilter: { column: 1 }, // Column B in Dropdown sheet
  locationFilter: { column: 2 } // Column C in Dropdown sheet
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadDropdownValues().then(() => {
    loadTableData(); // Load main table data after dropdowns are populated
  });
});

// Function to load dropdown values from Dropdown sheet
async function loadDropdownValues() {
  const sheetId = '16dH0QCUyKd5fpM_0P4riOgF3n8COrhruSN0HbXau3pI';
  const apiKey = 'AIzaSyBlha6kRb9lO7g3Id1wcD96QFYmQS7Kwow';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${dropdownSheetName}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const rows = data.values;
    
    // Skip header row if exists
    const startRow = rows[0][0] === 'Category' ? 1 : 0;
    
    // Process each dropdown configuration
    for (const [filterId, config] of Object.entries(dropdownConfig)) {
      const filterElement = document.getElementById(filterId);
      const uniqueValues = new Set();
      
      // Collect unique values from specified column
      for (let i = startRow; i < rows.length; i++) {
        if (rows[i][config.column]) {
          uniqueValues.add(rows[i][config.column]);
        }
      }
      
      // Populate dropdown
      populateDropdown(filterElement, Array.from(uniqueValues).sort());
      
      // Add event listener
      filterElement.addEventListener('change', applyFilters);
    }
  } catch (error) {
    console.error('Error loading dropdown values:', error);
  }
}

// Function to load main table data
async function loadTableData() {
  const sheetId = '16dH0QCUyKd5fpM_0P4riOgF3n8COrhruSN0HbXau3pI';
  const apiKey = 'AIzaSyBlha6kRb9lO7g3Id1wcD96QFYmQS7Kwow';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${mainSheetName}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const rows = data.values;
    
    const tableBody = document.getElementById('table-body');
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
        <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${formatDate(row[0] || '')}</td>
        <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${row[1] || ''}</td>
        <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">
          <a href="mailto:${row[2] || ''}" class="text-blue-600 hover:underline">${row[2] || ''}</a>
        </td>
        <td class="px-4 py-3 text-sm text-gray-700 border-b break-words max-w-xs">${row[3] || ''}</td>
      `;
      tableBody.appendChild(tr);
    }
  } catch (error) {
    console.error('Error loading table data:', error);
  }
}

// Helper functions
function populateDropdown(dropdown, values, defaultText = 'All') {
  dropdown.innerHTML = `<option value="">${defaultText}</option>`;
  values.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    dropdown.appendChild(option);
  });
}

function applyFilters() {
  const categoryValue = document.getElementById('categoryFilter').value;
  const vendorTypeValue = document.getElementById('vendorTypeFilter').value;
  const locationValue = document.getElementById('locationFilter').value;
  
  const filteredData = allTableData.filter(row => {
    // Adjust these indexes based on your main sheet columns
    const rowCategory = row[1] || ''; // Example: Column E for category
    const rowVendorType = row[5] || ''; // Example: Column F for vendor type
    const rowLocation = row[6] || ''; // Example: Column G for location
    
    return (!categoryValue || rowCategory === categoryValue) &&
           (!vendorTypeValue || rowVendorType === vendorTypeValue) &&
           (!locationValue || rowLocation === locationValue);
  });
  
  renderTable(filteredData);
}

function renderTable(data) {
  const tableBody = document.getElementById('table-body');
  tableBody.innerHTML = '';
  
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 transition-colors';
    tr.innerHTML = `
      <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${formatDate(row[0] || '')}</td>
      <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">${row[1] || ''}</td>
      <td class="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap">
        <a href="mailto:${row[2] || ''}" class="text-blue-600 hover:underline">${row[2] || ''}</a>
      </td>
      <td class="px-4 py-3 text-sm text-gray-700 border-b break-words max-w-xs">${row[3] || ''}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}