import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.regex.Pattern;

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
import com.mongodb.client.model.Filters;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.set;


@WebServlet("/AccountServlet")
@MultipartConfig
public class AccountServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
	private DatabaseModel model = DatabaseModel.getInstance();
	private MongoCollection<Document> collection = model.getAccountsCollection();
	private MongoCollection<Document> collectionPost = model.getPostsCollection();
	
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	    	
    	System.out.println("Account servlet doGet");
    	
    	String source = request.getParameter("source");
    	System.out.println("Account Servlet Request came from: " + source);
    	
    	if( source.equals("homePage") || source.equals("discoverPage") ) {
        	HttpSession session = request.getSession(false);
        	String clickedUser = request.getParameter("clickedUser");
        	String loggedInUser = (String) session.getAttribute("loggedInUser");
			session.setAttribute("clickedUser", clickedUser);
			
			System.out.println("Logged In user is: " + loggedInUser);
			System.out.println("Clicked on user is: " + clickedUser);

        	String liked = request.getParameter("liked");
        	String postIdString = request.getParameter("postId");
        	
        	System.out.println("Liked : " + liked);
        	System.out.println("postIdString : " + postIdString);
    		
    		if( liked != null ){
            	ObjectId postId = new ObjectId ( postIdString );
            	String likedStatus = updateLiked( liked, postId, loggedInUser );
        		        		
        		Gson gson = new Gson();
            	String json = gson.toJson( likedStatus );
            	response.getWriter().write( json );
            	return;
    		}
    		
    		// Redirect to the userPage if clicked on a profile
    		if( "userPage".equals(request.getParameter("target")) ) {
    			response.sendRedirect( "./html/userPage.html" );
    		}

    	}
    	
    	// Once gotten to the userPage.html do this
    	if( source.equals("userPage") ) {
        	HttpSession session = request.getSession(false);
        	String clickedUser = (String) session.getAttribute( "clickedUser" );
        	
    		System.out.println("Clicked User: " + clickedUser);
    		Document account = getAccount( clickedUser );
    		
    		if( request.getParameter("followButton") != null ){
    			String text = request.getParameter("text");
    			Document loggedInUser = getAccount( (String) session.getAttribute("loggedInUser") );
        		updateFollow( loggedInUser, clickedUser, text );
    		}
    		
    		// Add loggedInUser to the data being passed to the js
    		account.append("loggedInUser", session.getAttribute( "loggedInUser" ));
    		
    		Gson gson = new Gson();
        	String json = gson.toJson( account );
        	response.getWriter().write( json );    
        	
        	return;
    	}
    	
    	if (source.equals("searchPage")) {
    		String query = request.getParameter("query");
    		String type = request.getParameter("type");
    		System.out.println("Searching for: " + query + " (Type: " + type + ")");

    		List<Document> results = new ArrayList<>();
    		List<Document> temp = new ArrayList<>();
    		Pattern regex = Pattern.compile(query, Pattern.CASE_INSENSITIVE);

    		if ("users".equals(type)) {
    			// Search users by username
            	HttpSession session = request.getSession(false);
    			String loggedInUser = (String) session.getAttribute("loggedInUser");
    			temp = collection.find(Filters.regex("accountUsername", regex)).into(new ArrayList<>());
    			for( Document result: temp ) {
    				result = HelperClass.hideInfo(result);
    				results.add( result );
    				if( result.getString( "accountUsername" ).equals( loggedInUser ) )
    					results.remove( result );
    			}
    		}
    		else if ("recipes".equals(type)) {
	    		// Search recipes by name or description
	    		results = collectionPost.find(Filters.or(
	    				Filters.regex("recipeName", regex),
	    				Filters.regex("description", regex)
	    				)).into(new ArrayList<>());
	    		
	    		for(Document doc: results) {
	    			ObjectId id = (ObjectId) doc.get("_id");
	    			doc.put("_id", id.toHexString());
	    		}
    		}

    		// Convert to JSON
    		Gson gson = new Gson();
    		String json = gson.toJson(results);
    		response.getWriter().write(json);
    		
    		return;
    	}
    	
    	
    	if( source.equals("settingsPage") && request.getParameter("deleteAccount") != null) {
        	HttpSession session = request.getSession(false);
        	String loggedInUser = (String) session.getAttribute("loggedInUser");
    		HelperClass.deleteAccount( loggedInUser );
    		source = "logout";
    	}
    	
    	
    	// If user clicks the logout button
    	if( source.equals("logout") ) {
    		HttpSession session = request.getSession(false);
    		if (session != null) {
    			session.invalidate();
    		}
    		System.out.println("User successfully logged out");
    		response.sendRedirect( "index.html" );
    		return;
    	}
    	
    	
		// Get account data from MongoDB
    	HttpSession session = request.getSession(false);
    	String username = (String) session.getAttribute( "loggedInUser" );
    	Document account = getAccount( username );
    	if( source.equals("settingsPage") && request.getParameter("deleteAccount") == null) {
    		account.put( "password", HelperClass.getPassword( username ) );
    	}
	
    	// Convert MongoDB document list to JSON
    	Gson gson = new Gson();
    	String json = gson.toJson( account );
    	
    	response.getWriter().write( json );    	
    }
    
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	
    	System.out.println("Account servlet doPost");

    	response.setContentType("application/json");
    	response.setCharacterEncoding("UTF-8");
    	String username = null;
    	
    	System.out.println("THE FORM TYPE IS: "  + request.getParameter( "formType" ));
    	
		try {
			if( request.getParameter( "formType" ).equals( "createAccount" )) {
				String[] accountInfo = new String[6];
				accountInfo[0] = request.getParameter("accountUsername");
				accountInfo[4] = request.getParameter("firstName");
				accountInfo[5] = request.getParameter("lastName");
				accountInfo[2] = request.getParameter("email");
				accountInfo[3] = request.getParameter("dob");
				accountInfo[1] = request.getParameter("password");
				
				username = createAccount( accountInfo );
			}
			
			if( request.getParameter( "formType" ).equals( "signIn" )) {
				String[] accountInfo = new String[6];
				accountInfo[0] = request.getParameter("accountUsername");
				accountInfo[1] = request.getParameter("password");
				
				username = signIn( accountInfo );
			}
			
			if( request.getParameter( "formType" ).equals( "updateSettings" )) {
				HttpSession session = request.getSession(false);
		    	username = (String) session.getAttribute( "loggedInUser" );
		    	
		    	String newPassword = request.getParameter("password");
				String newBio = request.getParameter("bio");
				Part imagePart = request.getPart("imagePath");

				Document account = getAccounAllInfo( username );
				System.out.println("Account trying to change: " + account.toString());
				if( !newPassword.equals("") ) {
					System.out.println("new username is not nothing!!");
					account.put("password", newPassword);
					// FIX
					// Password Check
				}
				if( !newBio.equals("") ) {
					account.put("bio", newBio);
				}
				if( imagePart != null && imagePart.getSize() > 0 ) {
					HelperClass.deleteAWSImage( account.getString("imagePath") );
					
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
					account.put("imagePath", imageURL);
				}

				collection.replaceOne(new Document("_id", account.getObjectId("_id")), account);
				response.sendRedirect( "html/profilePage.html" );
			}
			
			if( ! username.equals("") ) {
				HttpSession session = request.getSession();
				session.setAttribute("loggedInUser", username);
				response.sendRedirect( "html/profilePage.html" );
			}
			
			else {
				if( request.getParameter( "formType" ).equals( "signIn" ) )
					response.sendRedirect( "html/signIn.html?error=invalid" );
				
				else if( request.getParameter( "formType" ).equals( "createAccount" ) )
					response.sendRedirect( "html/createAccount.html?error=invalid" );
				
				else
					response.sendRedirect( "index.html" );
			}
		}
		// Catch any exceptions
    	catch ( Exception e) {
    		System.out.println( "Error while generating the Creating / Signing into an account" );
		}
	}
    

    ///////////////////////////			METHODS
    
    public String updateLiked( String likedString, ObjectId postId, String loggedInUser  ) {
    	Document query = new Document("_id", postId );
    	Document post = collectionPost.find( query ).first();
    	List<Document> likedList = (List<Document>) post.get("liked");
    	boolean duplicate = false;
       	boolean liked = likedString.equals("true");
       	String previousLikedStatus = "";
    	
    	for (Document d : likedList) {
    		if(d.getString("user").equals( loggedInUser )) {
    			if( d.getBoolean("value") == liked ) {
    				duplicate = true;
    			}
    			previousLikedStatus = String.valueOf( d.getBoolean("value") );
    		}
    	}
    	
    	// Remove existing entry for this user if it exists
    	likedList.removeIf(doc -> doc.getString("user").equals( loggedInUser ));
    	
    	if( !duplicate ) {
        	// Add new value
        	Document likeEntry = new Document("user", loggedInUser).append("value", liked);
        	likedList.add(likeEntry);
    	}

    	// Update the post
    	collectionPost.updateOne(eq("_id", postId), set("liked", likedList));

    	if( previousLikedStatus.equals("") )
    		return "nothing";
    	return previousLikedStatus;
    }
    
    public List<Document> getAccounts( String searchText ) {
    	List<Document> accounts = new ArrayList<>();
    	Document query = new Document("accountUsername", new Document("$regex", searchText));
    	FindIterable<Document> results = collection.find( query );
 	 	
 	 	for (Document account : results) {
 	 		account = HelperClass.hideInfo( account );
 	 		accounts.add( account );
 	 	}
    	
    	return accounts;
    }
    
 	public void updateFollow( Document account, String name, String text ) {
 		ObjectId id;
 		Document clickedAccount = getAccount( name );
 		
 		if( text.equals("Follow") ) {
	 		id = account.getObjectId("_id");
	 		List<String> following = (List<String>) account.get("following");
	 		following.add( name );
	 		account.put("following", following);
	 		collection.updateOne(eq("_id", id), set("following", following));
	 		System.out.println("Should be updating the following of: " + account.getString("accountUsername"));
	 		
	 		id = clickedAccount.getObjectId("_id");
	 		List<String> followers = (List<String>) clickedAccount.get("followers");
	 		followers.add( account.getString("accountUsername") );
	 		clickedAccount.put("followers", followers);
	 		collection.updateOne(eq("_id", id), set("followers", followers));
	 		System.out.println("Should be updating the followers of: " + clickedAccount.getString("accountUsername"));
 		}
 		else if( text.equals("Unfollow") ) {
 			id = account.getObjectId("_id");
	 		List<String> following = (List<String>) account.get("following");
	 		following.remove( name );
	 		account.put("following", following);
	 		collection.updateOne(eq("_id", id), set("following", following));
	 		System.out.println("Should be updating the following of: " + account.getString("accountUsername"));
	 		
	 		id = clickedAccount.getObjectId("_id");
	 		List<String> followers = (List<String>) clickedAccount.get("followers");
	 		followers.remove( account.getString("accountUsername") );
	 		clickedAccount.put("followers", followers);
	 		collection.updateOne(eq("_id", id), set("followers", followers));
	 		System.out.println("Should be updating the followers of: " + clickedAccount.getString("accountUsername"));
 		}
 	}
    
    // Method to fetch all accounts user is following
 	public List<Document> getFollowing( String username ) {
 		Document query = new Document("accountUsername", username );
 		Document account = collection.find( query ).first();

 		List<String> followerUsernames = account.getList("following", String.class);
 		
 		query = new Document("accountUsername", new Document("$in", followerUsernames));
 		List<Document> followers = collection.find(query).into(new ArrayList<>());
 		return followers;
 	}
    
    // Method to fetch all followers of user
 	public List<Document> getFollowers( String username ) {
 		Document query = new Document("accountUsername", username );
 		Document account = collection.find( query ).first();

 		List<String> followerUsernames = account.getList("followers", String.class);
 		
 		query = new Document("accountUsername", new Document("$in", followerUsernames));
 		List<Document> followers = collection.find(query).into(new ArrayList<>());
 		return followers;
 	}
    
    // Method to fetch all accounts
 	public Document getAccount( String username ) {
 		Document query = new Document("accountUsername", username );
 		Document account = collection.find( query ).first();
 		account = HelperClass.hideInfo( account );
 		return account;
 	}
 	
    // Method to fetch all accounts
 	public Document getAccounAllInfo( String username ) {
 		Document query = new Document("accountUsername", username );
 		Document account = collection.find( query ).first();
 		return account;
 	}

 	// Method to fetch all accounts
 	public List<Document> getAccounts() {
 		List<Document> accountList = new ArrayList<>();
 		accountList = collection.find().into(new ArrayList<>());
 		return accountList;
 	}
 	
	// Method to take an array of info and create a document to add to collection
	public String createAccount( String[] accountInfo ) {
		String username = "";
		List<Document> currentAccounts = getAccounts();
		
		for( Document account: currentAccounts ) {
			if( account.get("accountUsername").equals( accountInfo[0] ) ) {
				System.out.println("Duplicate username");
				return username;
			}
		}
		
		try {
			Document newAccount = new Document( "accountUsername", accountInfo[0] )
					.append( "password", accountInfo[1] )
					.append( "email", accountInfo[2] )
					.append( "dob", accountInfo[3] )
					.append( "firstName", accountInfo[4] )
					.append( "lastName", accountInfo[5] )
					.append( "bio", "" )
					.append( "following", new ArrayList<String>() )
					.append( "followers", new ArrayList<String>() )
					.append( "imagePath", "https://recipe-images-485.s3.us-east-2.amazonaws.com/tempImage.png" );
			
			collection.insertOne( newAccount );
			username = accountInfo[0];
			System.out.println( "Successfully created account" );
		}
		catch( Exception e ) {
			System.out.println("Failed to Create Account");
			System.out.println(e.getMessage());
		}
		
		HelperClass.setLoggedInUser( username );
		return username;
	}
	
	// Method to take an array of info and create a document to add to collection
	public String signIn( String[] accountInfo ) {
		String username = "";
		try {
			Document query = new Document("accountUsername", accountInfo[0] );
			Document account = collection.find( query ).first();
			if( account != null ) {
				if( account.getString( "password" ).equals( accountInfo[1] ) ) {
					username = accountInfo[0];
				}
				else {
					System.out.println("Incorrect password");
				}
			}
			else {
				// Handle Account not existing
				System.out.println( "Account doesn't exist" );
			}
		}
		catch( Exception e ) {
			System.out.println("Failed to Sign in");
			System.out.println( e );
		}
		HelperClass.setLoggedInUser( username );

		return username;
	}
		
}