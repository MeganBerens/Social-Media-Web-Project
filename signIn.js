$(document).ready(function () { 

	const urlParams = new URLSearchParams(window.location.search);
	const error = urlParams.get("error");
	const errorMessageDiv = document.getElementById("error-message");

	if (error) {
		errorMessageDiv.textContent = "It looks like either your username or password is incorrect.";
	}
	else {
		errorMessageDiv.textContent = "";
	}
	
    //same idea as the previous validation js page
    function validateField() {
        let isValid = true; 
        const field = $(this); 
        const value = field.val().trim(); 
        const fieldId = field.attr('id'); 

        field.next('.error').remove(); 

        //checks
        if (fieldId === 'username') {
            if (!value) {``
                isValid = false; // marks it as invalid
                field.after('<span class="error">Username is required.</span>'); // adds an error message after the field
            }
        } else if (fieldId === 'password') { // checks for password field
            if (!value) {
                isValid = false; // marks it as invalid
                field.after('<span class="error">Password is required.</span>'); // adds an error message after the field
            }
        }

        return isValid; 
    }

    // Validate fields on blur
    $('#username, #password').on('blur', validateField); 

    // Clear error messages on focus
    $('#username, #password').on('focus', function () { 
        $(this).next('.error').remove(); 
    });

    // Validate the entire form on submit
    $('#signInForm').on('submit', function (e) { 
        e.preventDefault(); 

        let isFormValid = true; 
        $('.error').remove(); 

        // 
        $('#username, #password').each(function () { 
            isFormValid = validateField.call(this) && isFormValid; 
        });

        // if valid submit
        if (isFormValid) { 
            this.submit(); 
        }
    });
});
