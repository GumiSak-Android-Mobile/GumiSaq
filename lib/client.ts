import { Client, Databases } from "react-native-appwrite";

export const config = {
	platform: "com.saqcloth.gumisaq",
	endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
	projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
	databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
	artikelCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ARTIKEL_COLLECTION_ID,
	foodRecallCollectionId:
		process.env.EXPO_PUBLIC_APPWRITE_FOOD_RECALL_COLLECTION_ID,
	usersProfileCollectionId:
		process.env.EXPO_PUBLIC_APPWRITE_USERS_PROFILE_COLLECTION_ID,
	ahligiziCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AHLIGIZI_COLLECTION_ID,
	chatMessagesCollectionId:
		process.env.EXPO_PUBLIC_APPWRITE_CHAT_MESSAGES_COLLECTION_ID,
	adminChatCollectionId:
		process.env.EXPO_PUBLIC_APPWRITE_ADMIN_CHAT_COLLECTION_ID,
};
export const client = new Client();
client
	.setEndpoint(config.endpoint!)
	.setProject(config.projectId!)
	.setPlatform(config.platform!);
export const databases = new Databases(client);
