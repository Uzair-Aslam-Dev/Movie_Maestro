import { Client, Databases,ID, Query } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(PROJECT_ID)

const database = new Databases(client)

export const updateSearchCount = async (searchItem, movie) => {
    try{
        const response = await database.listDocuments(DATABASE_ID,COLLECTION_ID,[
            Query.equal('searchItem',searchItem),
        ])
        if(response.documents.length>0){
            const doc = response.documents[0];

            await database.updateDocument(DATABASE_ID,COLLECTION_ID,doc.$id, {
                count: (doc.count || 0) + 1,
            })
        }else{
            await database.createDocument(DATABASE_ID,COLLECTION_ID,ID.unique(), {
                searchItem,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`, 
            })
        }
    }catch (error){
        console.error(`Error updating count for movies: ${error}`);
    }
}

export const getTrendingMovies = async () => {
    try{
        const result = await database.listDocuments(DATABASE_ID,COLLECTION_ID,[
            Query.limit(5),
            Query.orderDesc("count")
        ])
        return result.documents;
    }catch(error){
        console.error(error);
        return [];
    }
}

export const WISHLIST_COLLECTION_ID = import.meta.env.VITE_APPWRITE_WISHLIST_COLLECTION_ID;


export const addToWishlist = async (movie) => {
  try {
    const exists = await database.listDocuments(
      DATABASE_ID,
      WISHLIST_COLLECTION_ID,
      [Query.equal("movieid", movie.id)]
    );

    if (exists.total > 0) {
      console.log("Already in wishlist!");
      return { alreadyExists: true };
    }

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "";

    const doc = await database.createDocument(
      DATABASE_ID,
      WISHLIST_COLLECTION_ID,
      ID.unique(),
      {
        movieid: movie.id,
        title: movie.title,
        poster: posterUrl,
      }
    );

    return doc;

  } catch (error) {
    console.error("Error adding to wishlist:", error);
  }
};


export const getWishlist = async () => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      WISHLIST_COLLECTION_ID,
      [Query.orderDesc("$createdAt")]
    );

    console.log("Fetched wishlist:", result.documents);
    return result.documents;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
};


export const removeFromWishlist = async (documentId) => {
  try {
    await database.deleteDocument(
      DATABASE_ID,
      WISHLIST_COLLECTION_ID,
      documentId
    );
    console.log("Removed from wishlist: ",documentId);
  } catch (error) {
    console.error("Error removing from wishlist:", error);
  }
};

export const isMovieInWishlist = async (movieid) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      WISHLIST_COLLECTION_ID,
      [Query.equal("movieid", movieid)]
    );
    return result.total > 0;  
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
};
