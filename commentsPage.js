
document.addEventListener("DOMContentLoaded", () => {
		
	
	const urlParams = new URLSearchParams(window.location.search);
	const postId = urlParams.get("postId");
	document.getElementById("postId").value = postId;
	
	fetch( `../PostServlet?source=commentsPage&postId=${postId}` ).then( response => response.json() ).then( data => {
			
		const container = document.getElementById("post-container");
		container.innerHTML = "";
	
		data.forEach( (post, index) => {
			
			console.log( post );
			
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
											
			const postDiv = document.createElement("div");
			postDiv.classList.add("post");
			
			postDiv.innerHTML = `
							
				<p class="accountUsername" id="accountUsername">${post.accountUsername}'s recipe:</p>
				<p class="recipe-name" id="recipe-name">${post.recipeName}</p>
				<img class="recipe-pic" id="recipe-pic" src="${post.imagePath || '../images/cooking1.jpg'}">
				
				
				<div class="home-post-actions">
					<button class="icon-btn like-btn">
						<i class="fa-solid fa-thumbs-up"></i>
						<span class="like-count">${numLikes || 0}</span>
					</button>
					
					<button class="icon-btn dislike-btn">
						<i class="fa-solid fa-thumbs-down"></i>
						<span class="dislike-count">${numDislikes || 0}</span>
					</button>
					
					<button class="icon-btn comment-btn">
						<i class="fa-solid fa-comment"></i>
						<span class="comment-count">${post.commentCount || 0}</span>
					</button>
				</div>
				
				`;
							
			container.appendChild( postDiv );
			
			const likeIcon = postDiv.querySelector('.fa-thumbs-up');
			const dislikeIcon = postDiv.querySelector('.fa-thumbs-down');
							
			if(likeStatus === "liked") {
				likeIcon.classList.add("liked-post");
			}
			else if	(likeStatus === "disliked") {
				dislikeIcon.classList.add("liked-post");
			}

			const likeButton = postDiv.querySelector('.like-btn');
			likeButton.addEventListener('click', () => {
						
				fetch( `../AccountServlet?source=homePage&liked=true&postId=${post._id}&clickedUser=${post.accountUsername}` ).then( response => response.json() ).then( data => {
					
					likeIcon.classList.remove("liked-post");
					dislikeIcon.classList.remove("liked-post");
					
					const likeCountElement = postDiv.querySelector('.like-count');
					const dislikeCountElement = postDiv.querySelector('.dislike-count');

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

			const dislikeButton = postDiv.querySelector('.dislike-btn');
			dislikeButton.addEventListener('click', () => {
						
				fetch( `../AccountServlet?source=homePage&liked=false&postId=${post._id}&clickedUser=${post.accountUsername}` ).then( response => response.json() ).then( data => {

					likeIcon.classList.remove("liked-post");
					dislikeIcon.classList.remove("liked-post");
					
					const likeCountElement = postDiv.querySelector('.like-count');
					const dislikeCountElement = postDiv.querySelector('.dislike-count');

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
		
	});
		
		
		
		
	
	fetch( `../CommentsServlet?postId=${postId}` ).then( response => response.json() ).then( data => {
		
			const container = document.getElementById("comments");
			container.innerHTML = "";
		
			data.forEach( (comment, index) => {
												
				const commentDiv = document.createElement("div");
				commentDiv.classList.add("comment");
				
				commentDiv.innerHTML = `
								
					<p class="comment-account" id="comment-account">${comment.accountUsername}:</p>
					
					<p class="comment-text" id="comment-text">${comment.commentDescription}</p>
					
					`;
							
				container.appendChild(commentDiv);

			});
			
			
			if(data.length === 0) {
				const commentDiv = document.createElement("div");
				commentDiv.classList.add("comment");
				
				commentDiv.innerHTML = `
					<p class="no-comments-msg" id="no-comments-msg">There are no comments yet.</p>
				`;
				container.appendChild(commentDiv);
			}	
	});
	
	
	
	document.getElementById("commentForm").addEventListener("submit", function (e) {
		this.submit();
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