import java.util.ArrayList;
import java.util.List;

import org.bson.Document;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoClient;

public class DatabaseModel {
	
	private static DatabaseModel instance = null;
	private static MongoClient mongoClient = null;
	private static MongoDatabase database = null;
	
	// Singleton pattern
	synchronized public static DatabaseModel getInstance() {
		if (instance == null) {
			instance = new DatabaseModel();
		}
		return instance;
	}

	// Private constructor to establish connection
	private DatabaseModel() {
		try {
			// Change this for user
			mongoClient = MongoClients.create("mongodb+srv://Tony:QFjuzuBLd6pRRClt@recipecluster.95qmp.mongodb.net");
			// Name of the database
			database = mongoClient.getDatabase("recipedb");
		}
		catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public MongoCollection<Document> getAccountsCollection() {
		return database.getCollection("Accounts"); 
	}
	
	public MongoCollection<Document> getPostsCollection() {
		return database.getCollection("Posts"); 
	}
	
	public MongoCollection<Document> getTipsCollection() {
		return database.getCollection("Tips"); 
	}
	
	public MongoCollection<Document> getCommentsCollection() {
		return database.getCollection("Comments"); 
	}
	
}