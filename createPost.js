$(document).ready(function () {
    function validateField() {
        let isValid = true; // Starts with assuming the field is valid
        const field = $(this);
        const value = field.val().trim();
        const fieldId = field.attr('id'); // Gets the ID of the field

        // Clear previous error messages
        field.next('.error').remove();

        // Validate based on field type (only checking for empty here)
        if (fieldId === 'recipeName') {
            if (!value) {
                isValid = false;
                field.after('<span class="error">' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1) + ' is required.</span>');
            }
        } else if (fieldId === 'description') {
            if (!value) {
                isValid = false;
                field.after('<span class="error">' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1) + ' is required.</span>');
            }
        } else if (fieldId === 'ingredientList') {
            if (!value) {
                isValid = false;
                field.after('<span class="error">' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1) + ' is required.</span>');
            }
        } else if (fieldId === 'instructions') {
            if (!value) {
                isValid = false;
                field.after('<span class="error">' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1) + ' is required.</span>');
            }
        }

        return isValid; 
    }

    $('#recipeName, #description, #ingredientList, #instructions').on('blur', validateField);

    $('#recipeName, #description, #ingredientList, #instructions').on('focus', function () {
        $(this).next('.error').remove();
    });

    $('#postForm').on('submit', function (e) {
        e.preventDefault(); // Prevents default form submission

        let isFormValid = true; // Starts with assuming the form is valid
        $('.error').remove(); // Clears all previous error messages

        // Validate all fields
        $('#recipeName, #description, #ingredientList, #instructions').each(function () {
            isFormValid = validateField.call(this) && isFormValid;
        });

        if (isFormValid) {
            this.submit();
        }
    });
	
					 // Mobile menu toggle
					  const menu = document.querySelector('#mobile-menu');
					  const menuLinks = document.querySelector('.navbar-menu');

					  if (menu && menuLinks) {
					    menu.addEventListener('click', function () {
					      menu.classList.toggle('is-active');
					      menuLinks.classList.toggle('active');
					    });
					  }
});