import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;

import org.bson.Document;
import org.bson.types.ObjectId;

import com.google.gson.Gson;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@WebServlet("/PostServlet")
@MultipartConfig
public class PostServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
	private DatabaseModel model = DatabaseModel.getInstance();
	private MongoCollection<Document> collection = model.getPostsCollection();
	private String accountUsername;
	private String clickedUsername;
				
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	
    	System.out.println("Post servlet doGet");

    	// Get post data from MongoDB
    	HttpSession session = request.getSession(false);
    	accountUsername = (String) session.getAttribute( "loggedInUser" );
    	clickedUsername = (String) session.getAttribute( "clickedUser" );
    	
    	String source = request.getParameter("source");

    	List<Document> posts = new ArrayList<>();
    	
    	// If profilePage is calling doGet send this user's posts
    	if( source.equals("profilePage") ) {
    		System.out.println("Displaying " + accountUsername + "'s posts");
    		posts = getUsersPosts( accountUsername );
    		
    		if( request.getParameter("postId") != null ) {
	        	HelperClass.deletePost( request.getParameter("postId") );
	        	posts = getUsersPosts( accountUsername );
    		}
    	}
    	
    	// If user clicks on to a post
    	else if( ( source.equals("homePage") || source.equals("discoverPage") ) && (request.getParameter("target") != null) ) {
    		String postId = request.getParameter("postId");
    		session.setAttribute("postId", postId);
    		response.sendRedirect( "./html/postPage.html" );
    	}
    	else if( source.equals("postPage") || source.equals("commentsPage")) {
    		session = request.getSession(false);
    		String postIdString = (String) session.getAttribute("postId");
    		if( postIdString == null) {
    			postIdString = request.getParameter("postId");
    		}
    		ObjectId postId = new ObjectId( postIdString );
    		Document post = getPost( postId );
 			post.put("commentCount", HelperClass.getCommentCount( postIdString ));
    		
    		List<Document> temp = new ArrayList<>();
    		temp.add(post);
    		posts = temp;
    	}
    	
    	// If homePage is calling doGet send following posts
    	else if( source.equals("homePage") ) {
    		System.out.println("Displaying " + accountUsername + "'s followers' posts");
    		posts = getFollowingPosts();
    	}
    	
    	// If discoverPage is calling doGet send recent posts
    	else if( source.equals("discoverPage") ) {
    		System.out.println("Displaying the most recent 21 posts");
    		posts = getRecentPosts();
    	}
    	
    	// If userPage is calling doGet send corresponding user posts
    	else if( source.equals("userPage") ) {
    		posts = getUsersPosts( clickedUsername );
    	}
    	
    	//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    	for (Document post : posts) {
    		// For each post, add the correct profile image
    		String username = post.getString("accountUsername");
    		String profilePic = HelperClass.getProfilePic( username );
    		post.append("profilePic", profilePic);
    		
    		// For each post, turn the id into a readable value
    		ObjectId objectId = post.getObjectId("_id");
    		post.put("_id", objectId.toHexString());
    		
    		// For each post, add the loggedInUser
    		String loggedInUser = HelperClass.getLoggedInUser();
    		post.append("loggedInUser", loggedInUser);
    	}
    	
    	// Convert MongoDB document list to JSON
    	Gson gson = new Gson();
    	String json = gson.toJson( posts );
    	
    	response.getWriter().write( json );    	
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    	System.out.println("Post servlet doPost");

    	response.setContentType("application/json");
    	response.setCharacterEncoding("UTF-8");
    	
    	HttpSession session = request.getSession(false);
    	accountUsername = (String) session.getAttribute( "loggedInUser" );
    	
		try {
			if( request.getParameter( "formType" ).equals( "createPost" )) {
				String[] postInfo = new String[6];
				postInfo[0] = request.getParameter("recipeName");
				postInfo[1] = request.getParameter("description");
				postInfo[2] = request.getParameter("ingredientList");
				postInfo[3] = request.getParameter("instructions");
				
				// Get image
				Part imagePart = request.getPart("image");
				
				createPost( postInfo, imagePart );
			}
			
			response.sendRedirect( "html/profilePage.html" );
		}
		// Catch any exceptions
    	catch ( Exception e) {
    		System.out.println( "Error while generating the Creating / Signing into an account" );
		}
	}
    
    ////////////////// METHODS
    
    
    public Document getPost( ObjectId postId ) {
    	Document post;
    	Document query = new Document("_id", postId);
    	post = collection.find(query).first();
    	
    	return post;
    }
    
    
    public List<Document> getFollowingPosts() {
    	List<Document> posts = new ArrayList<>();
    	List<String> following = getFollowing();
 		
    	if( following.isEmpty() )
    		return posts;
    	
 		// For each account user is following, add posts to list
    	Document query = new Document("accountUsername", new Document("$in", following));
    	
 		posts = collection.find(query).into(new ArrayList<>());
 		// Reverse so it shows the most recent first
 		Collections.reverse(posts);
 		
 		for( Document item : posts) {
 			String postId = item.getObjectId("_id").toHexString();
 			item.put("commentCount", HelperClass.getCommentCount( postId ));
 		}

 		return posts;
    }
    
    // Method to fetch all accounts user is following
 	public List<String> getFollowing() {
 		
 		MongoCollection<Document> accountsCollection = model.getAccountsCollection();
 		Document query = new Document("accountUsername", accountUsername );
 		Document account = accountsCollection.find( query ).first();
 			
 		List<String> followers = account.getList("following", String.class);
 		
 		return followers;
 	}
    
    public List<Document> getRecentPosts() {
    	List<Document> posts = new ArrayList<>();
 		
 		// Gets the 20 most recent posts
    	int totalDocs = (int) collection.countDocuments();
 		// FindIterable<Document> results = collection.find().skip((int)Math.max(0, totalDocs - 20));
 		FindIterable<Document> results = collection.find();
 		
 		// For each post that comes up, add to list to return 
 		for( Document item: results ) {
 			// Check each post if the imagePath attribute is empty, if so give it temporary image
 			if( item.getString("imagePath") == null || item.getString("imagePath").trim().isEmpty() 
 												|| item.getString("imagePath").trim().equals("null") ) {
 				item.put("imagePath", "https://recipe-images-485.s3.us-east-2.amazonaws.com/tempImage.png");
 			}
 			String postId = item.getObjectId("_id").toHexString();
 			item.put("commentCount", HelperClass.getCommentCount( postId ));
 			posts.add( item );
 		}
 		
 		Collections.reverse(posts);
 		
 		return posts;
    }
    
    // Method to fetch all posts from account
 	public List<Document> getUsersPosts( String username ) {
 		Document query = new Document("accountUsername", username );
 		FindIterable<Document> results = collection.find(query);
    	List<Document> posts = new ArrayList<>();
 		
 		// For each post that comes up with correct accountUsername, add to list to return 
 		for( Document item: results ) {
 			// Check each post if the imagePath attribute is empty, if so give it temporary image
 			if( item.getString("imagePath") == null || item.getString("imagePath").trim().isEmpty() 
 												|| item.getString("imagePath").trim().equals("null") ) {
 				item.put("imagePath", "https://recipe-images-485.s3.us-east-2.amazonaws.com/tempImage.png");
 			}
 			String postId = item.getObjectId("_id").toHexString();
 			item.put("commentCount", HelperClass.getCommentCount( postId ));
 			posts.add(item);
 		}
 		Collections.reverse(posts);
 		return posts;
 	}
 	
 	// Method to take an array of info and create a document to add to collection
 	public void createPost( String[] postInfo, Part imagePart) { 	
 		 		
		try {		
			AWSModel awsModel = AWSModel.getInstance();
			
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			try (InputStream input = imagePart.getInputStream()) {
				input.transferTo(baos);
			}
			byte[] imageBytes = baos.toByteArray();
			InputStream freshStream = new ByteArrayInputStream(imageBytes);
			long size = imageBytes.length;
			
			String fileName = Paths.get(imagePart.getSubmittedFileName()).getFileName().toString();
			String contentType = imagePart.getContentType();			
			String uniqueFileName = java.util.UUID.randomUUID().toString() + "-" + fileName;
			String bucketName = awsModel.getBucketName();
			
			PutObjectRequest putRequest = PutObjectRequest
					.builder()
					.bucket(bucketName)
					.key(uniqueFileName)
					.contentType(contentType)
					.build();
			
			awsModel.getS3Client().putObject(putRequest, RequestBody.fromInputStream(freshStream, size));
						
			String imageURL = "https://" + bucketName + ".s3.amazonaws.com/" + uniqueFileName;
					
			Document newPost = new Document( "recipeName", postInfo[0] )
 					.append( "description", postInfo[1] )
 					.append( "accountUsername", accountUsername )
 					.append( "ingredientList", postInfo[2] )
 					.append( "instructions", postInfo[3] )
 					.append( "imagePath", imageURL )
 					.append("liked", new ArrayList<Document>());
 			
 			collection.insertOne( newPost );
 			
 			System.out.println("Successfully created post");
		} 
		catch ( Exception e ) {
 			System.out.println("Failed to Create Post");
		}
 	}
}