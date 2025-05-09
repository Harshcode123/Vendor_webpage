// Google Sheet Configuration
const SHEET_ID = '16dH0QCUyKd5fpM_0P4riOgF3n8COrhruSN0HbXau3pI';
const API_KEY = 'AIzaSyBlha6kRb9lO7g3Id1wcD96QFYmQS7Kwow';

// Configuration for dropdown data
const dropdownConfig = {
    vehicleType: {
        sheetName: 'Dropdown',
        column: 'C', // Vehicle Type is in Column C
        element: '#vehicleTypeOptions .options-container',
        placeholder: '#vehicleTypePlaceholder',
        selectedContainer: '#selectedVehicleTypes',
        dropdown: '#vehicleTypeDropdown',
        options: '#vehicleTypeOptions',
        selected: []
    },
    fromLocations: {
        sheetName: 'Dropdown',
        column: 'A', // From locations (Category) are in Column A
        elements: [
            {
                element: '#fromLocation1Options .options-container',
                placeholder: '#fromLocation1Placeholder',
                selectedContainer: '#selectedFromLocations1',
                dropdown: '#fromLocation1Dropdown',
                options: '#fromLocation1Options',
                selected: []
            },
            {
                element: '#fromLocation2Options .options-container',
                placeholder: '#fromLocation2Placeholder',
                selectedContainer: '#selectedFromLocations2',
                dropdown: '#fromLocation2Dropdown',
                options: '#fromLocation2Options',
                selected: []
            }
        ]
    },
    toLocations: {
        sheetName: 'Dropdown',
        column: 'B', // To locations (Destination) are in Column B
        elements: [
            {
                element: '#toLocation1Options .options-container',
                placeholder: '#toLocation1Placeholder',
                selectedContainer: '#selectedToLocations1',
                dropdown: '#toLocation1Dropdown',
                options: '#toLocation1Options',
                selected: []
            },
            {
                element: '#toLocation2Options .options-container',
                placeholder: '#toLocation2Placeholder',
                selectedContainer: '#selectedToLocations2',
                dropdown: '#toLocation2Dropdown',
                options: '#toLocation2Options',
                selected: []
            }
        ]
    }
};

// Fetch data from Google Sheet for a specific column
async function fetchColumnData(sheetName, column) {
    try {
        // Get the entire sheet data
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}?key=${API_KEY}`
        );
        const data = await response.json();
        
        if (data.values && data.values.length > 1) {
            // Skip header row and get the specified column
            const columnIndex = column.charCodeAt(0) - 'A'.charCodeAt(0);
            const uniqueValues = new Set();
            
            for (let i = 1; i < data.values.length; i++) {
                if (data.values[i][columnIndex]) {
                    uniqueValues.add(data.values[i][columnIndex]);
                }
            }
            
            return Array.from(uniqueValues).map(value => [value]);
        }
        return [];
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Initialize dropdown with options
function initializeDropdown(config, data) {
    const optionsContainer = document.querySelector(config.element);
    optionsContainer.innerHTML = '';

    data.forEach(item => {
        const option = document.createElement('div');
        option.className = 'flex items-center p-2 hover:bg-gray-100 cursor-pointer';
        option.innerHTML = `
            <input type="checkbox" id="${item[0]}" value="${item[0]}" class="mr-2">
            <label for="${item[0]}">${item[0]}</label>
        `;
        optionsContainer.appendChild(option);

        // Add event listener for checkbox
        const checkbox = option.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                config.selected.push(this.value);
            } else {
                const index = config.selected.indexOf(this.value);
                if (index > -1) {
                    config.selected.splice(index, 1);
                }
            }
            updateSelectedOptions(config);
        });
    });
}

// Update selected options display
function updateSelectedOptions(config) {
    const selectedContainer = document.querySelector(config.selectedContainer);
    const placeholder = document.querySelector(config.placeholder);
    
    if (config.selected.length > 0) {
        selectedContainer.innerHTML = '';
        placeholder.style.display = 'none';
        
        config.selected.forEach(value => {
            const selectedOption = document.createElement('div');
            selectedOption.className = 'selected-option';
            selectedOption.innerHTML = `
                <span>${value}</span>
                <button type="button" class="remove-option text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            `;
            selectedContainer.appendChild(selectedOption);
            
            // Add event listener for remove button
            const removeButton = selectedOption.querySelector('.remove-option');
            removeButton.addEventListener('click', function() {
                const index = config.selected.indexOf(value);
                if (index > -1) {
                    config.selected.splice(index, 1);
                    updateSelectedOptions(config);
                    
                    // Update checkbox state
                    const checkbox = document.querySelector(`input[value="${value}"]`);
                    if (checkbox) {
                        checkbox.checked = false;
                    }
                }
            });
        });
    } else {
        selectedContainer.innerHTML = '';
        placeholder.style.display = 'inline';
    }
}

// Toggle dropdown visibility
function setupDropdownToggle() {
    const dropdowns = document.querySelectorAll('.multi-select-dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggler = dropdown.querySelector('[id$="Dropdown"]');
        const options = dropdown.querySelector('[id$="Options"]');
        const searchInput = options.querySelector('input[type="text"]');
        
        toggler.addEventListener('click', function() {
            options.classList.toggle('active');
            
            if (options.classList.contains('active')) {
                searchInput.focus();
            }
        });
        
        // Search functionality
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const allOptions = options.querySelectorAll('.options-container div');
            
            allOptions.forEach(option => {
                const optionText = option.textContent.toLowerCase();
                if (optionText.includes(searchTerm)) {
                    option.style.display = 'flex';
                } else {
                    option.style.display = 'none';
                }
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!dropdown.contains(event.target)) {
                options.classList.remove('active');
            }
        });
    });
}

// Form submission
// Update the form submission handler to close the modal
// Update the form submission handler
document.getElementById('vendorForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Show loading spinner
    document.getElementById('loading').classList.remove('hidden');
    
    try {
        // Get all form data
        const formData = new FormData(this);
        
        // Add the multi-select values to the form data
        formData.append('vehicleTypes', dropdownConfig.vehicleType.selected.join(', '));
        formData.append('fromLocations1', dropdownConfig.fromLocations.elements[0].selected.join(', '));
        formData.append('toLocations1', dropdownConfig.toLocations.elements[0].selected.join(', '));
        formData.append('fromLocations2', dropdownConfig.fromLocations.elements[1].selected.join(', '));
        formData.append('toLocations2', dropdownConfig.toLocations.elements[1].selected.join(', '));
        
        // Convert form data to object
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        // Send data to Google Sheets
        await fetch('https://script.google.com/macros/s/AKfycbw5KtjyYsA-uVcTGoaJAF5LwzC4dcL10fGHCQ44QOvKCm__PfaAPOJzn4XKDiRbWDsv/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Show success message
        document.getElementById('success-message').classList.remove('hidden');
        
        // Redirect to index.html after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error submitting form. Please try again.');
    } finally {
        // Hide loading spinner
        document.getElementById('loading').classList.add('hidden');
    }
});




// Initialize the application
async function init() {
    // Fetch vehicle types (Column C)
    const vehicleTypes = await fetchColumnData(dropdownConfig.vehicleType.sheetName, dropdownConfig.vehicleType.column);
    initializeDropdown(dropdownConfig.vehicleType, vehicleTypes);
    
    // Fetch from locations (Column A - Category)
    const fromLocations = await fetchColumnData(dropdownConfig.fromLocations.sheetName, dropdownConfig.fromLocations.column);
    
    // Initialize from locations
    dropdownConfig.fromLocations.elements.forEach(config => {
        initializeDropdown(config, fromLocations);
    });
    
    // Fetch to locations (Column B - Destination)
    const toLocations = await fetchColumnData(dropdownConfig.toLocations.sheetName, dropdownConfig.toLocations.column);
    
    // Initialize to locations
    dropdownConfig.toLocations.elements.forEach(config => {
        initializeDropdown(config, toLocations);
    });
    
    // Setup dropdown toggle behavior
    setupDropdownToggle();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
