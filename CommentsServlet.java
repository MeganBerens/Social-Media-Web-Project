import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;

import org.bson.Document;

import com.google.gson.Gson;
import com.mongodb.client.MongoCollection;

@WebServlet("/CommentsServlet")
public class CommentsServlet extends HttpServlet {
	
	private DatabaseModel model = DatabaseModel.getInstance();
	private MongoCollection<Document> collection = model.getCommentsCollection();
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
				
    	System.out.println("Comments servlet doGet");

		String postId = request.getParameter("postId");
		List<Document> comments = new ArrayList<>();
		comments = getComments( postId );
		
		// Convert MongoDB document list to JSON
    	Gson gson = new Gson();
    	String json = gson.toJson( comments );
    	
    	response.getWriter().write( json );
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    	System.out.println("Comments servlet doPost");

		response.setContentType("application/json");
    	response.setCharacterEncoding("UTF-8");
    	
    	String commentText = request.getParameter("comment-input");
    	String postId = request.getParameter("postId");
    	HttpSession session = request.getSession(false);
    	String accountUsername = (String) session.getAttribute( "loggedInUser" );
    	
		try {
			createComment( postId, accountUsername, commentText );
			response.sendRedirect("html/commentsPage.html?postId=" + postId);
		}
		// Catch any exceptions
    	catch ( Exception e) {
    		System.out.println( "Error while creating the comment" );
		}
	}
	
	// Other methods to help
	
	public void createComment( String postId, String accountUsername, String commentText ) {
		Document newComment = new Document( "postId", postId )
				.append( "accountUsername", accountUsername )
				.append( "commentDescription", commentText );
		
		collection.insertOne( newComment );
		System.out.println( "Successfully created comment" );
	}
	
	public List<Document> getComments( String postId ) {
		Document query = new Document("postId", postId ); 
		List<Document> comments = collection.find(query).into(new ArrayList<>());	
		
 		return comments;
	}
	
	public List<Document> getCommentsCollection() {
		List<Document> comments = collection.find().into(new ArrayList<>());
 		return comments;
	}

}