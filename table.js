// Global variables
let allTableData = [];
const dropdownSheetName = "Dropdown"; // Name of your dropdown sheet
const mainSheetName = "Vendor"; // Name of your main data sheet

// Configuration for sheet access
const sheetConfig = {
  id: '16dH0QCUyKd5fpM_0P4riOgF3n8COrhruSN0HbXau3pI',
  apiKey: 'AIzaSyBlha6kRb9lO7g3Id1wcD96QFYmQS7Kwow' // Consider moving to server-side in production
};

// Configuration for which columns to use for each dropdown
const dropdownConfig = {
  categoryFilter: { column: 0 }, // Column A in Dropdown sheet
  vendorTypeFilter: { column: 0 }, // Column B in Dropdown sheet
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
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetConfig.id}/values/${dropdownSheetName}?key=${sheetConfig.apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const rows = data.values;
    
    // Skip header row if exists
    const startRow = rows[0][0] === 'Category' ? 1 : 0;
    
    // Process each dropdown configuration
    for (const [filterId, config] of Object.entries(dropdownConfig)) {
      const filterElement = document.getElementById(filterId);
      if (!filterElement) continue;
      
      const uniqueValues = new Set();
      
      // Collect unique values from specified column
      for (let i = startRow; i < rows.length; i++) {
        if (rows[i] && rows[i][config.column]) {
          uniqueValues.add(rows[i][config.column]);
        }
      }
      
      // Create searchable dropdown
      createSearchableDropdown(filterId, Array.from(uniqueValues).sort());
    }
  } catch (error) {
    console.error('Error loading dropdown values:', error);
  }
}

// Function to create searchable dropdown
function createSearchableDropdown(elementId, options) {
  const originalSelect = document.getElementById(elementId);
  if (!originalSelect) return;
  
  // Get the parent element that contains the label and select
  const parentElement = originalSelect.parentElement;
  
  // Create wrapper div with relative positioning for the custom dropdown
  const dropdownWrapper = document.createElement('div');
  dropdownWrapper.className = 'relative w-full';
  
  // Create input element for search
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'w-full p-2 border border-gray-300 rounded pr-8'; // Added padding-right for the icon
  searchInput.placeholder = 'Search or select...';
  searchInput.dataset.value = ''; // To store the actual selected value
  
  // Create dropdown icon
  const dropdownIcon = document.createElement('div');
  dropdownIcon.className = 'absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none';
  dropdownIcon.innerHTML = '<i class="fas fa-chevron-down"></i>';
  
  // Create dropdown container
  const dropdownContainer = document.createElement('div');
  dropdownContainer.className = 'absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto hidden';
  
  // Add "All" option
  const allOption = document.createElement('div');
  allOption.className = 'p-2 hover:bg-gray-100 cursor-pointer';
  allOption.textContent = 'All';
  allOption.dataset.value = '';
  allOption.addEventListener('click', () => {
    searchInput.value = 'All';
    searchInput.dataset.value = '';
    dropdownContainer.classList.add('hidden');
    triggerFilterChange(elementId);
  });
  dropdownContainer.appendChild(allOption);
  
  // Add all options
  options.forEach(option => {
    const optionElement = document.createElement('div');
    optionElement.className = 'p-2 hover:bg-gray-100 cursor-pointer';
    optionElement.textContent = option;
    optionElement.dataset.value = option;
    optionElement.addEventListener('click', () => {
      searchInput.value = option;
      searchInput.dataset.value = option;
      dropdownContainer.classList.add('hidden');
      triggerFilterChange(elementId);
    });
    dropdownContainer.appendChild(optionElement);
  });
  
  // Handle input for filtering options
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    
    // Always show "All" option
    dropdownContainer.childNodes.forEach((node, index) => {
      if (index === 0) return; // Skip "All" option
      
      const optionText = node.textContent.toLowerCase();
      if (optionText.includes(searchTerm)) {
        node.classList.remove('hidden');
      } else {
        node.classList.add('hidden');
      }
    });
    
    // Show dropdown if not already visible
    dropdownContainer.classList.remove('hidden');
  });
  
  // Toggle dropdown on click
  searchInput.addEventListener('click', () => {
    dropdownContainer.classList.toggle('hidden');
  });
  
  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdownWrapper.contains(e.target)) {
      dropdownContainer.classList.add('hidden');
    }
  });
  
  // Add elements to the wrapper
  dropdownWrapper.appendChild(searchInput);
  dropdownWrapper.appendChild(dropdownIcon);
  dropdownWrapper.appendChild(dropdownContainer);
  
  // Replace the original select with our custom dropdown
  originalSelect.style.display = 'none';
  parentElement.appendChild(dropdownWrapper);
}

// Function to trigger filter change event
function triggerFilterChange(elementId) {
  applyFilters();
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

// Function to apply filters
function applyFilters() {
  // Get values from custom searchable dropdowns
  const categoryValue = document.querySelector('#categoryFilter + div input')?.dataset.value || '';
  const vendorTypeValue = document.querySelector('#vendorTypeFilter + div input')?.dataset.value || '';
  const locationValue = document.querySelector('#locationFilter + div input')?.dataset.value || '';
  
  const filteredData = allTableData.filter(row => {
    // Adjust these indexes based on your main sheet columns
    const rowCategory = row[1] || ''; // Example: Column B for category
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