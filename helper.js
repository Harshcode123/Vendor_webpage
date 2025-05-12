document.addEventListener('DOMContentLoaded', function() {
    // Auto-capture timestamp
    const timestampField = document.getElementById('timestamp');
    timestampField.value = new Date().toISOString();
    
    const emailField = document.getElementById('email');
    const emailChangeBtn = document.getElementById('changeEmailBtn');
    const form = document.getElementById('taskForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Load saved email if available
    if (localStorage.getItem('userEmail')) {
        emailField.value = localStorage.getItem('userEmail');
        // Verify the email is registered
        verifyEmail(emailField.value);
    }
    
    // Email change button handler
    emailChangeBtn.addEventListener('click', function() {
        // Enable editing email field
        emailField.readOnly = false;
        emailField.focus();
        
        // Change button text
        this.textContent = 'Verify';
        // Change button function to verify instead of edit
        this.removeEventListener('click', arguments.callee);
        this.addEventListener('click', function() {
            verifyEmail(emailField.value);
        });
    });
    
    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // First verify the email is registered
        verifyEmail(emailField.value, true);
    });
    
    function verifyEmail(email, submitAfterVerify = false) {
        // Trim the email to remove any whitespace
        email = email.trim();
        
        // Show verifying message
        errorMessage.textContent = 'Verifying email...';
        errorMessage.classList.remove('hidden');
        errorMessage.classList.remove('bg-red-100', 'text-red-700');
        errorMessage.classList.add('bg-yellow-100', 'text-yellow-700');
        
        // Disable form elements during verification
        submitButton.disabled = true;
        emailField.readOnly = true;
        emailChangeBtn.disabled = true;
        
        // Log verification attempt
        console.log('Verifying email:', email);
        
        // Prepare verification data
        const verificationData = new URLSearchParams();
        verificationData.append('action', 'verifyEmail');
        verificationData.append('email', email.toLowerCase()); // Convert to lowercase for consistent comparison
        
        // Send to Google Script for verification against Doers sheet
        const scriptURL = 'https://script.google.com/macros/s/AKfycbzRVBmyyFkyCEk0D4PY1ekna2qtAHtjPKNuLsQAFloZUh1MfYFXhLFpA4kIa2nEIqcR/exec';
        
        fetch(scriptURL, {
            method: 'POST',
            body: verificationData,
            mode: 'cors' // Add CORS mode explicitly
        })
        .then(response => {
            console.log('Verification response status:', response.status);
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok: ' + response.status);
        })
        .then(data => {
            console.log('Verification response data:', data);
            if (data.result === 'success' && data.isRegistered) {
                // Email is registered
                localStorage.setItem('userEmail', email);
                emailField.readOnly = true;
                
                // Update email change button
                emailChangeBtn.textContent = 'Change Email';
                emailChangeBtn.disabled = false;
                emailChangeBtn.removeEventListener('click', arguments.callee);
                emailChangeBtn.addEventListener('click', function() {
                    emailField.readOnly = false;
                    emailField.focus();
                    this.textContent = 'Verify';
                    
                    this.removeEventListener('click', arguments.callee);
                    this.addEventListener('click', function() {
                        verifyEmail(emailField.value);
                    });
                });
                
                // Enable submit button
                submitButton.disabled = true;
                
                // Hide error message
                errorMessage.classList.add('hidden');
                
                // Submit form if this verification was initiated from submit
                if (submitAfterVerify) {
                    submitFormData();
                }
            } else {
                // Email is not registered
                showError('This email is not registered in our system. Please use a registered email.');
                emailField.readOnly = false;
                emailField.focus();
                
                // Update email change button
                emailChangeBtn.textContent = 'Verify';
                emailChangeBtn.disabled = false;
                
                // Keep submit button disabled
                submitButton.disabled = true;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('There was a problem verifying your email. Please try again later or contact support.');
            
            // Re-enable fields
            emailField.readOnly = false;
            emailChangeBtn.disabled = false;
            submitButton.disabled = false;
        });
    }
    
    function submitFormData() {
        // Disable the submit button to prevent multiple submissions
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        
        // Prepare form data
        const formData = new URLSearchParams();
        formData.append('action', 'submitForm');
        formData.append('timestamp', document.getElementById('timestamp').value);
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('lrNumber', document.getElementById('lrNumber').value);
        formData.append('assignee', document.getElementById('assignee').value);
        formData.append('task', document.getElementById('task').value);
        formData.append('reason', document.getElementById('reason').value);
        formData.append('completionDate', document.getElementById('completionDate').value);
        
        // Submit to Google Sheets
        const scriptURL = 'https://script.google.com/macros/s/AKfycbzRVBmyyFkyCEk0D4PY1ekna2qtAHtjPKNuLsQAFloZUh1MfYFXhLFpA4kIa2nEIqcR/exec';
        
        // Log submission attempt
        console.log('Submitting form data...');
        
        fetch(scriptURL, {
            method: 'POST',
            body: formData,
            mode: 'cors' // Add CORS mode explicitly
        })
        .then(response => {
            console.log('Submission response status:', response.status);
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok: ' + response.status);
        })
        .then(data => {
            console.log('Submission response data:', data);
            if (data.result === 'success') {
                showSuccess();
                form.reset();
                
                // Reset the email field with the verified email
                emailField.value = localStorage.getItem('userEmail');
                emailField.readOnly = true;
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('There was a problem submitting the form. Please try again later.');
        })
        .finally(() => {
            // Re-enable the submit button after request completes
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        });
    }
    
    function showSuccess() {
        successMessage.classList.remove('hidden');
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 3000);
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden', 'bg-yellow-100', 'text-yellow-700');
        errorMessage.classList.add('bg-red-100', 'text-red-700');
    }
});