//this just validates that the user input somethign into the boxes, however will we use a routes and models and views type structure to talk to db?

$(document).ready(function () { 

	const urlParams = new URLSearchParams(window.location.search);
	const error = urlParams.get("error");
	const errorMessageDiv = document.getElementById("error-message");
	
	if (error) {
		errorMessageDiv.textContent = "Oh no. It looks like that username is already in use.";
	}
	else {
		errorMessageDiv.textContent = "";
	}
	
    function validateField() {
        let isValid = true; // starts with assuming the field is valid, will turn to false if check is bad
        const field = $(this); 
        const value = field.val().trim(); 
        const fieldId = field.attr('id'); // gets the id of the field to know which field we're dealing with

        // clear previous error messages
        field.next('.error').remove(); 

        // validate based on field type
        if (fieldId === 'firstName' || fieldId === 'lastName') { // checks if it's first or last name
            if (!value) { // if value is empty
                isValid = false; // marks invalid
                field.after('<span class="error">' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1) + ' is required.</span>'); // adds an error message after the field
            }

            //validation for username being empty or not
        //}else if(fieldId === 'username'){
         //   if(!value){
        //        isValid = false;
        //        field.after('<span class="error">Username is required.</span');
       //     }
        
        //email check
        } else if (fieldId === 'email') { 
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //regex
            if (!emailPattern.test(value)) { 
                isValid = false; // marks invalid
                field.after('<span class="error">Please enter a valid email address.</span>'); 
            }
			

        //dob check
        } 
		
		else if (fieldId === 'dob') { // checks for date of birth
            const dob = new Date(value); // creates a date object from the value
            const age = new Date().getFullYear() - dob.getFullYear(); 
            if (!value) { 
                isValid = false; 
                field.after('<span class="error">Please enter a DOB</span>'); // adds an error message after the field
            }
            if (age < 18 || isNaN(dob)) { // checks if age is less than 18 or if dob is invalid
                isValid = false; // marks it as invalid
                field.after('<span class="error">You must be at least 18 years old.</span>'); // adds error message, this comes up even when nothing was entered
            }
			
			
        //password check
        } else if (fieldId === 'password') { 
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/; // regex 
            if (!passwordPattern.test(value)) { // tests the value against the regex
                isValid = false; // mark invalid
                field.after('<span class="error">Password must be at least 5 characters long and include a number, an uppercase letter, a lowercase letter, and a special character.</span>'); 
            }
			
			
        //confirm password check
        } else if (fieldId === 'confirmPassword') { 
            const password = $('#password').val(); 
            if (password !== value) { // checks if passwords match, if they don't it will give an error
                isValid = false; // marks it as invalid
                field.after('<span class="error">Passwords must match.</span>'); // adds error message
            }
        }

        return isValid; 
    };

    // validate fields on blur so when user clicks out of hte box it tells them right away if they have an error
    $('#firstName, #lastName, #email, #dob, #password, #confirmPassword').on('blur', validateField); 

    // clear error messages on focus
    $('#firstName, #lastName, #email, #dob, #password, #confirmPassword').on('focus', function () { 
        $(this).next('.error').remove(); 
    });

    // password strength checking
    $('#password').on('input', function () { 
        const password = $(this).val(); // gets the current password value
        const strengthText = $('#password-strength'); // gets the password strength display element
        let strength = ''; 

        if (password.length < 5) {
            strength = 'Too short'; 
        } else if (password.length < 5) {
            strength = 'Weak'; 
        } else if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)) {
            strength = 'Strong'; 
        } else {
            strength = 'Moderate'; 
        }

        strengthText.text('Password strength: ' + strength); // tell sthe user their password strenght
    });

    // validate the entire form on submit
    $('#accountForm').on('submit', function (e) { 
        e.preventDefault(); // prevents the default form submission action

        let isFormValid = true; // starts with assuming the form is valid
        $('.error').remove(); // clears all previous error messages from the form

        // validate all fields
        $('#firstName, #lastName, #email, #dob, #password, #confirmPassword').each(function () { 
            isFormValid = validateField.call(this) && isFormValid; 
        });


        // if the form is valid submit it
        if (isFormValid) { 
            this.submit(); 
        }
    });
	
	function submitCreateAccount() {
		
	
	};
});
