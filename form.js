// Column mappings for dropdowns in Google Sheet
const formDropdownConfig = {
  // Update these column indexes to match your actual Google Sheet structure
  // Column indexes start at 0 (A=0, B=1, C=2, etc.)
  vehicleType: { column: 0 }, // Adjust this to the correct column
  from1: { column: 1 },       // Adjust this to the correct column
  to1: { column: 2 },         // Adjust this to the correct column
  from2: { column: 1 },       // Adjust this to the correct column
  to2: { column: 2 },         // Adjust this to the correct column
  from3: { column: 1 },       // Adjust this to the correct column
  to3: { column: 2 }          // Adjust this to the correct column
};

// Function to load dropdown values for the form with better debugging
async function loadFormDropdownValues() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetConfig.id}/values/${sheetConfig.dropdownSheetName}?key=${sheetConfig.apiKey}`;
  console.log("Fetching dropdown data from:", url);

  try {
      const response = await fetch(url);
      
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received sheet data:", data);
      
      if (!data.values || data.values.length === 0) {
          console.error("No data found in the sheet");
          return;
      }
      
      const rows = data.values;
      
      // Skip header row if exists
      const startRow = rows[0][0] === 'Category' ? 1 : 0;
      console.log("Starting from row:", startRow);
      
      // Process each form dropdown configuration
      for (const [dropdownId, config] of Object.entries(formDropdownConfig)) {
          console.log(`Processing dropdown: ${dropdownId}, column: ${config.column}`);
          
          const dropdownElement = document.getElementById(dropdownId);
          if (!dropdownElement) {
              console.warn(`Dropdown element not found: ${dropdownId}`);
              continue;
          }
          
          const uniqueValues = new Set();
          
          // Collect unique values from specified column
          for (let i = startRow; i < rows.length; i++) {
              if (rows[i] && rows[i][config.column] && rows[i][config.column].trim() !== '') {
                  uniqueValues.add(rows[i][config.column]);
              }
          }
          
          console.log(`Found ${uniqueValues.size} unique values for ${dropdownId}`);
          
          // Add a placeholder option
          dropdownElement.innerHTML = '';
          const placeholderOption = document.createElement('option');
          placeholderOption.value = '';
          placeholderOption.textContent = '-- Select Options --';
          placeholderOption.disabled = true;
          placeholderOption.selected = true;
          dropdownElement.appendChild(placeholderOption);
          
          // Populate dropdown with actual options
          Array.from(uniqueValues).sort().forEach(value => {
              const option = document.createElement('option');
              option.value = value;
              option.textContent = value;
              dropdownElement.appendChild(option);
          });
      }
  } catch (error) {
      console.error('Error loading form dropdown values:', error);
      // Show error in UI
      const dropdowns = document.querySelectorAll('select[multiple]');
      dropdowns.forEach(dropdown => {
          dropdown.innerHTML = '<option>Error loading options</option>';
      });
  }
}