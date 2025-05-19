
document.addEventListener('DOMContentLoaded', () => {
	
	fetch( "../AccountServlet?source=userPage" ).then( response => response.json() ).then( data => {
		
		console.log(data);

		if(data["accountUsername"] === (data["loggedInUser"])) {
			document.getElementById("follow-btn").style.display = "none";
		}
		else {
			document.getElementById("follow-btn").style.display = "inline-block";
		}
		
		let followText = "";
		if( data["followers"].includes( data["loggedInUser"] )) {
			followText = "Unfollow";
		}
		else {
			followText = "Follow";
		}
		
		document.getElementById("follow-btn").textContent = followText;
		document.getElementById("profile-home-username").textContent = data["accountUsername"];
		document.getElementById("profile-pic").src = data["imagePath"];
		document.getElementById("name-line").textContent =  "Welcome to " + data["firstName"] + "'s profile!";
		document.getElementById("followers-count").textContent = data["followers"].length;
		document.getElementById("following-count").textContent = data["following"].length;
		document.getElementById("profile-bio").textContent = data["bio"];
		
		const bioText = document.getElementById("profile-bio")
		if (bioText.textContent == "") {
		    bioText.textContent = data["firstName"] + ' has no bio yet :('
		}
		
	}).catch( error => console.error( "Error fetching profile:", error ));

	fetch( "../PostServlet?source=userPage" ).then( response => response.json() ).then( data => {
			
		const container = document.getElementById("main-img-container");
				
				container.innerHTML = "";
				
				let postCounter = 0;
					
					data.forEach( (post, index) => {
						
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
							
							postCounter++;
							
							postDiv.innerHTML = `
									
			                <div class="main-profile-img">
								<img src="${post.profilePic || '../images/cooking1.jpg'}" alt="Profile" id="home-user-img" class="home-user-img">
								<div id="home-username" class="home-username">${post.accountUsername || 'FOODLOVER101'}</div>
			                </div>
							
						<div class="description">${post.recipeName || 'FillerRecipeName'}</div>			
			
						<a href="../PostServlet?source=homePage&postId=${post._id}&target=postPage" class="main-profile-img-link">
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
					
					const commentButton = postDiv.querySelector('.comment-btn');
					commentButton.addEventListener('click', () => {
						// Go to commentsPage.hthml
						window.location.href = `commentsPage.html?postId=${post._id}`;
					});
					
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
								
				document.getElementById("posts-count").textContent = postCounter;
				
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
			
			const followButton = document.getElementById('follow-btn');
				
			followButton.addEventListener('click', () => {
				
				const followButtonText = document.getElementById('follow-btn').textContent;
				
				fetch( `../AccountServlet?source=userPage&followButton=true&text=${followButtonText}` ).then( response => response.json() ).then( data => {
					
						location.reload();
						
					}).catch( error => console.error( "Error fetching profile:", error ));
				
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
