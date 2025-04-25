// table.js
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

// Make this function globally accessible
window.loadTableData = function() {
  const sheetId = '16dH0QCUyKd5fpM_0P4riOgF3n8COrhruSN0HbXau3pI';
  const sheetName = 'Vendor';
  const apiKey = 'AIzaSyBlha6kRb9lO7g3Id1wcD96QFYmQS7Kwow';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const tableBody = document.getElementById('table-body');
      tableBody.innerHTML = '';
      const rows = data.values;
      
      const startRow = rows[0][0] === 'Timestamp' ? 1 : 0;
      
      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i];
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
    })
    .catch(error => console.error('Error fetching data:', error));
}

// Initial load
loadTableData();