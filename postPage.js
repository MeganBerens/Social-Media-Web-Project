document.addEventListener("DOMContentLoaded", () => {
	// Mobile menu toggle
	const menu = document.querySelector('#mobile-menu');
	const menuLinks = document.querySelector('.navbar-menu');
	
	if (menu && menuLinks) {
		menu.addEventListener('click', function () {
			menu.classList.toggle('is-active');
			menuLinks.classList.toggle('active');
		});
	}

	fetch( "../PostServlet?source=postPage" ).then( response => response.json() ).then( data => {

		data.forEach((post, index) => {
			let numLikes = 0;
			let numDislikes = 0;
			let likeStatus = "nothing";
			
			(post.liked || []).forEach(liked => {
	
				if(liked.value === true) {
					numLikes++;
				}
				else if(liked.value === false) {
					numDislikes++;
				}
				
				if(liked.user === post.loggedInUser) {
					if(liked.value === true) {
						likeStatus = "liked";
					}
					else {
						likeStatus = "disliked";
					}
				}			
			});
			
			console.log(data);
			document.getElementById("home-username").textContent = post.accountUsername;//username of the account on post
			document.getElementById("home-user-img").src = post.profilePic;//profile picture on post
			document.getElementById("recipe-name").textContent = post.recipeName;//recipe name
			document.getElementById("home-img").src = post.imagePath;//should be for the actual photo on post
			document.getElementById("like-count").textContent = numLikes
			document.getElementById("dislike-count").textContent = numDislikes
			document.getElementById("comment-count").textContent = post.commentCount;
			document.getElementById("description").textContent = post.description;
			document.getElementById("ingredient-list").textContent = post.ingredientList;
			document.getElementById("instructions").textContent = post.instructions;
			
			
			
			
			const likeIcon = document.querySelector('.fa-thumbs-up');
			const dislikeIcon = document.querySelector('.fa-thumbs-down');
			
			if(likeStatus === "liked") {
				likeIcon.classList.add("liked-post");
			}
			else if	(likeStatus === "disliked") {
				dislikeIcon.classList.add("liked-post");
			}

			const commentButton = document.querySelector('.comment-btn');
			commentButton.addEventListener('click', () => {
				// Go to commentsPage.hthml
				window.location.href = `commentsPage.html?postId=${post._id}`;
		    });
			

			const likeButton = document.querySelector('.like-btn');
			likeButton.addEventListener('click', () => {
						
				fetch( `../AccountServlet?source=homePage&liked=true&postId=${post._id}&clickedUser=${post.accountUsername}` ).then( response => response.json() ).then( data => {
					
					likeIcon.classList.remove("liked-post");
					dislikeIcon.classList.remove("liked-post");
					
					const likeCountElement = document.querySelector('.like-count');
					const dislikeCountElement = document.querySelector('.dislike-count');

					let previousLikedStatus = String(data);
					
					console.log( previousLikedStatus );

					if( previousLikedStatus === "true" ) {
						numLikes--;
					}
					else if( previousLikedStatus === "false" ) {
						numLikes++;
						numDislikes--;
						likeIcon.classList.add("liked-post");
					}
					else {
						numLikes++;
						likeIcon.classList.add("liked-post");
					}

					likeCountElement.textContent = numLikes;
					dislikeCountElement.textContent = numDislikes;
					
				}).catch( error => console.error( "Error fetching profile:", error ));
		    });
			
			// Get listener for the dislike button
			const dislikeButton = document.querySelector('.dislike-btn');
			dislikeButton.addEventListener('click', () => {
						
				fetch( `../AccountServlet?source=homePage&liked=false&postId=${post._id}&clickedUser=${post.accountUsername}` ).then( response => response.json() ).then( data => {

					likeIcon.classList.remove("liked-post");
					dislikeIcon.classList.remove("liked-post");
					
					const likeCountElement = document.querySelector('.like-count');
					const dislikeCountElement = document.querySelector('.dislike-count');

					let previousLikedStatus = String(data);
					
					console.log( previousLikedStatus );

					if( previousLikedStatus === "false" ) {
						numDislikes--;
					}
					else if( previousLikedStatus === "true" ) {
						numLikes--;
						numDislikes++;
						dislikeIcon.classList.add("liked-post");
					}
					else {
						numDislikes++;
						dislikeIcon.classList.add("liked-post");
					}

					likeCountElement.textContent = numLikes;
					dislikeCountElement.textContent = numDislikes;

				}).catch( error => console.error( "Error fetching profile:", error ));
			});
			
			
		});
		
		
		
	}).catch( error => console.error( "Error fetching post:", error ));

	const cards = document.querySelectorAll(".main-img-card");
	const observer = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.classList.add("reveal");
			observer.unobserve(entry.target);
		}
	});
	}, { threshold: 0.1 });
	
	cards.forEach(card => observer.observe(card));
});