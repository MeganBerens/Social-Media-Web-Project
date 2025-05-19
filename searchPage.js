document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.querySelector(".search-btn");
    const searchType = document.getElementById("search-type");
    const suggestedContainer = document.getElementById("suggested-users-container");

    const fetchResults = (query, isSearch = false) => {
        if (isSearch) suggestedContainer.innerHTML = "";
		if (!query && !isSearch) return;

        fetch(`../AccountServlet?source=searchPage&type=${searchType.value}&query=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) throw new Error("Network error");
                return response.json();
            })
            .then(data => {
                suggestedContainer.innerHTML = "";
                if (searchType.value === 'users') {
                    createUserCards(data);
                } else {
                    createRecipeCards(data);
                }
            })
            .catch(() => suggestedContainer.innerHTML = '<p class="description">Error loading results</p>');
    };

    const createUserCards = (users) => {
        if (users.length === 0) {
            suggestedContainer.innerHTML = '<p class="description">No users found</p>';
            return;
        }

        users.forEach(user => {
            const userDiv = document.createElement("div");
            userDiv.classList.add("main-img-card");
            userDiv.innerHTML = `
                <a href="../AccountServlet?source=homePage&clickedUser=${user.accountUsername}&target=userPage" 
                   class="main-profile-img-link">
                    <div class="main-profile-img">
                        <img src="${user.imagePath || '../images/tempImage.png'}" 
                             alt="Profile" 
                             class="home-user-img">
                        <div class="home-username">${user.accountUsername || 'Unknown User'}</div>
                    </div>
                </a>
                <p class="description">${user.bio || user.firstName + ' has no bio yet :('}</p>
            `;
            suggestedContainer.appendChild(userDiv);
            setupIntersectionObserver(userDiv);
        });
    };

    const createRecipeCards = (recipes) => {
        if (recipes.length === 0) {
            suggestedContainer.innerHTML = '<p class="description">No recipes found</p>';
            return;
        }
		
		console.log("recipes are " + recipes);

        recipes.forEach(recipe => {
            const recipeDiv = document.createElement("div");
            recipeDiv.classList.add("recipe-card");
			console.log("recipe is " + recipe._id);
            recipeDiv.innerHTML = `
				<a href="../PostServlet?source=homePage&postId=${recipe._id}&target=postPage" class="main-profile-img-link">
	                <img src="${recipe.imagePath || '../images/tempImage.png'}" 
	                     alt="${recipe.recipeName || 'Recipe image'}" 
	                     class="recipe-image">
				</a>
                <h3 class="recipe-title">${recipe.recipeName || 'Untitled Recipe'}</h3>
                <p class="recipe-description">${recipe.description || 'No description available'}</p>
				<a href="../AccountServlet?source=homePage&clickedUser=${recipe.accountUsername}&target=userPage" class="main-profile-img-link">
                	<p class="recipe-author">By ${recipe.accountUsername || 'Unknown Chef'}</p>
				</a>
            `;
            suggestedContainer.appendChild(recipeDiv);
            setupIntersectionObserver(recipeDiv);
        });
    };

    const setupIntersectionObserver = (element) => {
        const observer = new IntersectionObserver(
            entries => entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("reveal");
                    observer.unobserve(entry.target);
                }
            }),
            { threshold: 0.1 }
        );
        observer.observe(element);
    };

	searchBtn.addEventListener("click", () => {
	    const query = searchInput.value.trim();
	    fetchResults(query, true);
	});

    // Mobile menu toggle
    const menu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar-menu');
    if (menu && menuLinks) {
        menu.addEventListener('click', () => {
            menu.classList.toggle('is-active');
            menuLinks.classList.toggle('active');
        });
    }
});