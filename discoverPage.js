//const card = document.querySelector('#mainImgCard');
//const cardShow = document.querySelector('');

//card.addEventListener()

document.addEventListener("DOMContentLoaded", () => {
	
	fetch( "../PostServlet?source=discoverPage" ).then( response => response.json() ).then( data => {
		
			const container = document.getElementById("main-img-container");
			container.innerHTML = "";
			
			data.forEach( (post, index) => {
				
				console.log(post);
				
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
				postDiv.classList.add("main-img-card");
				
				postDiv.innerHTML = `
								
					<a href="../AccountServlet?source=discoverPage&clickedUser=${post.accountUsername}&target=userPage" class="main-profile-img-link">
		                <div class="main-profile-img">
		                    <img src="${post.profilePic || '../images/cooking1.jpg'}" alt="Profile" class="home-user-img" id="home-user-img">
							<div id="home-username" class="home-username">${post.accountUsername || 'FOODLOVER101'}</div>
		                </div>
					</a>
						
					<div class="description">${post.recipeName || 'FillerRecipeName'}</div>		
						
					<a href="../PostServlet?source=discoverPage&postId=${post._id}&target=postPage" class="main-profile-img-link">
						<img class="home-img" src="${post.imagePath || '../images/cooking3.jpg'}" alt="Post image">
					</a>
					
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
	                <p class="description">${post.description || "No description provided."}</p>
					
					`;
								
				container.appendChild(postDiv);
				
				const likeIcon = postDiv.querySelector('.fa-thumbs-up');
				const dislikeIcon = postDiv.querySelector('.fa-thumbs-down');

				if(likeStatus === "liked") {
					likeIcon.classList.add("liked-post");
				}
				else if	(likeStatus === "disliked") {
					dislikeIcon.classList.add("liked-post");
				}
				
				const commentButton = postDiv.querySelector('.comment-btn');
				commentButton.addEventListener('click', () => {
					// Go to commentsPage.hthml
					window.location.href = `commentsPage.html?postId=${post._id}`;
			    });
				
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
			
			// Reveal animation
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
      
		}).catch( error => console.error( "Error fetching profile:", error ));
	
		
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
