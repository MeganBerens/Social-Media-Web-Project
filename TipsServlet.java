import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.bson.Document;

import com.google.gson.Gson;
import com.mongodb.client.MongoCollection;

@WebServlet("/TipsServlet")
public class TipsServlet extends HttpServlet {
	
	private DatabaseModel model = DatabaseModel.getInstance();
	private MongoCollection<Document> collection = model.getTipsCollection();
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	
		System.out.println("Tips servlet doGet");

		List<Document> tips = new ArrayList<>();
		tips = getTips();
		
		// Convert MongoDB document list to JSON
    	Gson gson = new Gson();
    	String json = gson.toJson( tips );
    	
    	response.getWriter().write( json );
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// Use this to create a post, but we aren't doing that
		System.out.println("Tips servlet doPost");
	}
	
	// Other methods to help
	public List<Document> getTips() {
		List<Document> tips = collection.find().into(new ArrayList<>());

 		return tips;
	}

}