document.addEventListener('DOMContentLoaded', () => {
			const menu = document.querySelector('#mobile-menu');
			const menuLinks = document.querySelector('.navbar-menu');

			if (menu && menuLinks) {
			  menu.addEventListener('click', function () {
			    menu.classList.toggle('is-active');
			    menuLinks.classList.toggle('active');
			  });
			}
			
		
			fetch( "../AccountServlet?source=settingsPage" ).then( response => response.json() ).then( data => {
				document.getElementById("current-password-text").textContent = "Current Password: " + data["password"];
				document.getElementById("current-bio-text").textContent = "Current Bio: " + data["bio"];
				document.getElementById("current-profile-pic").src = data["imagePath"];
				
				const bioText = document.getElementById("current-bio-text")
				if (bioText.textContent == "") {
				    bioText.textContent = 'Current Bio: User has no bio yet :('
				}
			}).catch( error => console.error( "Error fetching profile:", error ));
			
			
			
			const deleteButton = document.querySelector('.delete-btn');

			deleteButton.addEventListener('click', () => {
				
				if (!deleteButton.classList.contains('confirm-delete')) {
					deleteButton.textContent = "Are you sure?";
					deleteButton.classList.add('confirm-delete');
				}
				else if (deleteButton.classList.contains('confirm-delete')) {
					fetch(`../AccountServlet?source=settingsPage&deleteAccount=true` );
					window.location.href = `../index.html`;
				}
		    });
			
		
			$('#settingsForm').on('submit', function (e) {
			    this.submit();
			});
			
});