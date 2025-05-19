document.addEventListener("DOMContentLoaded", () => {
		
	fetch( "../TipsServlet" ).then( response => response.json() ).then( data => {
		
			console.log(data);

			const container = document.getElementById("tip-box");
			container.innerHTML = "";
		
			data.forEach( (tip, index) => {
				
				console.log("Tip num");
				
				console.log(tip);
				
				const tipDiv = document.createElement("div");
				tipDiv.classList.add("tip");
				
				tipDiv.innerHTML = `
								
					<span class="tip-number" id="tip-number">Tip #${tip.tipNum}:</span>
					<span class="tip-description" id="tip-description">${tip.tipDesc}</span>
					
					`;
								
				container.appendChild(tipDiv);

			});
			
		
		const menu = document.querySelector('#mobile-menu');
		const menuLinks = document.querySelector('.navbar-menu');
		
		if (menu && menuLinks) {
			menu.addEventListener('click', function () {
				menu.classList.toggle('is-active');
				menuLinks.classList.toggle('active');
			});
		}
		
		
	});
});