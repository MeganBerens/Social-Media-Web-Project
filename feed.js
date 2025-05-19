//need to attach GET and POST methods to the icons
/**
 * id="like-btn"
 * id="dislike-btn"
 * id="comment-btn"
 * class="like-count"
 * class="dislike-count"
 * class="comment-count"
 * id="home-user-description"
 * id="home-username"
 * id="home-user-img"
 */
//will fetch the logged in users account info, will need the followers in the accounts data i believe
document.addEventListener("DOMContentLoaded", function(){
    fetchAccountData();
});


//need the js or java to get the users posts from the followers of logged in user
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


//will also need to fetch posts from backend
document.addEventListener("DOMContentLoaded", function(){
    fetchPosts();
});


function fetchAccountData(){
    fetch('/AccountServlet', {
        method: 'GET',
        headers:{
            'Content-Type': 'application/json',
        },
    })

        document.getElementById("home-username".textContent = `${Username}`);
        document.getElementById("home-user-img").src = profilePic;
        document.getElementById("home-user-description").textContent = description;


        //post actions
        document.getElementById("like-btn").querySelector("").textContent = likes;
        document.getElementById("dislike-btn").querySelector("").textContent = dislikes;
        document.getElementById("comment-btn").querySelector("").textContent = commentsCount;
   
    }
	
	//)
//}