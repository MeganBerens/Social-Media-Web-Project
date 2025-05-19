import java.util.ArrayList;
import java.util.List;

import org.bson.Document;
import org.bson.types.ObjectId;

import com.mongodb.client.MongoCollection;

import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

public class HelperClass {
	
	private static final DatabaseModel model = DatabaseModel.getInstance();
	private static final MongoCollection<Document> accountCollection = model.getAccountsCollection();
	private static final MongoCollection<Document> postCollection = model.getPostsCollection();
	private static final MongoCollection<Document> commentCollection = model.getCommentsCollection();
	
	private static String loggedInUser = "";
	
	public static Document getAccount(String username) {
		Document query = new Document("accountUsername", username);
		return accountCollection.find(query).first();
	}
		
	public static String getProfilePic(String username) {
		return getAccount(username).getString("imagePath");
	}
	
	public static void setLoggedInUser(String username) {
		loggedInUser = username;
	}
	
	public static String getLoggedInUser() {
		return loggedInUser;
	}
	
	public static int getCommentCount( String postId ) {
		List<Document> comments = new ArrayList<>();
		Document query = new Document("postId", postId);
		comments = commentCollection.find(query).into(new ArrayList<>());

		return comments.size();
	}
	
	public static void deletePost( String postIdString ) {
		ObjectId postId = new ObjectId(postIdString);
		Document post = postCollection.find(new Document("_id", postId)).first();
		deleteAWSImage( post.getString("imagePath") );
		postCollection.deleteOne(new Document("_id", postId));
        System.out.println("Post deleted successfully.");
		
		deleteComments( postIdString );
	}
	
	public static void deleteComments( String postId ) {
		commentCollection.deleteMany(new Document("postId", postId));
        System.out.println("Comments deleted successfully.");
	}
	
	public static void deleteAccount( String accountUsername ) {
		Document account = accountCollection.find(new Document("accountUsername", accountUsername)).first();
		deleteAWSImage( account.getString("imagePath") );
		accountCollection.deleteOne(new Document("accountUsername", accountUsername));
        System.out.println("Account deleted successfully.");

		Document query = new Document("accountUsername", accountUsername);
 		List<Document> posts = postCollection.find(query).into(new ArrayList<>());
 		List<String> postIds = new ArrayList<String>();
 		for( Document post : posts ) {
 			postIds.add(post.getObjectId("_id").toHexString());
 			deleteAWSImage( post.getString("imagePath") );
 		}
		postCollection.deleteMany(new Document("accountUsername", accountUsername));
        System.out.println("Posts linked to account deleted successfully.");

		for( String postId : postIds ) {
			commentCollection.deleteMany(new Document("postId", postId));
		}
		commentCollection.deleteMany(new Document("accountUsername", accountUsername));
        System.out.println("Comments linked to account deleted successfully.");
	}
	
	public static void deleteAWSImage( String imagePath ) {
		try {
			if ( imagePath.equals("https://recipe-images-485.s3.us-east-2.amazonaws.com/tempImage.png") ) {
				return;
			}
			AWSModel awsModel = AWSModel.getInstance();
			String bucketName = awsModel.getBucketName();
			String key = imagePath.substring(imagePath.lastIndexOf("/") + 1);
			DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder().bucket(bucketName).key(key).build();
			
			awsModel.getS3Client().deleteObject( deleteRequest );
	        System.out.println("Post deleted from AWS successfully.");
		}
		catch(Exception e) {
			System.out.println("Error deleting image, possibility of not having access");
		}
	}
	
	public static Document hideInfo( Document account ) {
		account.remove("dob");
		account.remove("email");
		account.remove("lastName");
		account.remove("password");
		return account;
	}
	
	public static String getPassword( String accountUsername ) {
		Document account = getAccount( accountUsername );
		return account.getString("password");
	}
	
}