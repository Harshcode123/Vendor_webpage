// Google Sheets configuration
const SPREADSHEET_ID = '1dJwftR4KK-afoBZ7npdYd6lrvzC9iGC2xL5mPD-65d4';
const API_KEY = 'AIzaSyBlha6kRb9lO7g3Id1wcD96QFYmQS7Kwow';

// DOM elements
const dataTable = document.getElementById('dataTable');
const tableHead = dataTable.querySelector('thead tr');
const tableBody = dataTable.querySelector('tbody');
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');
const currentSheetDisplay = document.getElementById('currentSheet').querySelector('span');
const sheetButtons = document.querySelectorAll('.sheet-btn');

// Data variables
let currentData = [];
let visibleColumns = [];
let filteredData = [];
let currentSheet = '';

// Fetch data from Google Sheets
async function fetchData(sheetName) {
    try {
        currentSheet = sheetName;
        currentSheetDisplay.textContent = sheetName;
        
        // First get sheet metadata to check hidden columns
        const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?includeGridData=true&ranges=${sheetName}&key=${API_KEY}`;
        const metadataResponse = await fetch(metadataUrl);
        const metadata = await metadataResponse.json();
        
        // Determine visible columns
        const sheet = metadata.sheets[0];
        visibleColumns = [];
        sheet.data[0].columnMetadata.forEach((col, index) => {
            if (!col.hiddenByUser) {
                visibleColumns.push(index);
            }
        });
        
        // Then get the actual data
        const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`;
        const dataResponse = await fetch(dataUrl);
        const data = await dataResponse.json();
        
        if (data.values && data.values.length > 0) {
            currentData = data.values;
            filteredData = [...currentData];
            renderData();
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data. Check console for details.');
    }
}

// Render data based on current filter
function renderData() {
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    
    if (filteredData.length <= 1) {
        noResults.classList.remove('hidden');
        dataTable.classList.add('hidden');
    } else {
        noResults.classList.add('hidden');
        dataTable.classList.remove('hidden');
        
        const headers = filteredData[0];
        
        // Create headers only for visible columns
        visibleColumns.forEach(colIndex => {
            const th = document.createElement('th');
            th.textContent = headers[colIndex];
            th.className = 'py-2 px-3 text-left text-sm font-semibold sticky top-0 bg-gray-800';
            tableHead.appendChild(th);
        });
        
        // Add data rows (skip header row)
        for (let i = 1; i < filteredData.length; i++) {
            const row = filteredData[i];
            const tr = document.createElement('tr');
            tr.className = 'table-row';
            
            // Add only visible columns
            visibleColumns.forEach(colIndex => {
                const td = document.createElement('td');
                td.textContent = row[colIndex] || '';
                td.className = 'py-2 px-3 border-t border-gray-700 text-sm';
                tr.appendChild(td);
            });
            
            tableBody.appendChild(tr);
        }
    }
}

// Filter data based on search term
function filterData(searchTerm) {
    if (!searchTerm) {
        filteredData = [...currentData];
        renderData();
        return;
    }
    
    const term = searchTerm.toLowerCase();
    const headers = currentData[0];
    
    // Filter rows (skip header row)
    filteredData = [headers, ...currentData.slice(1).filter(row => {
        return row.some((cell, index) => {
            // Only search in visible columns
            if (!visibleColumns.includes(index)) return false;
            return cell.toString().toLowerCase().includes(term);
        });
    })];
    
    renderData();
}

// Event listeners
refreshBtn.addEventListener('click', () => {
    if (currentSheet) {
        fetchData(currentSheet);
    }
});

searchInput.addEventListener('input', (e) => filterData(e.target.value));

// Add event listeners to sheet buttons
sheetButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sheetName = button.getAttribute('data-sheet');
        
        // Update button styles
        sheetButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        fetchData(sheetName);
    });
});

// Initial load - load first sheet by default
document.querySelector('.sheet-btn[data-sheet="Lifelong"]').click();