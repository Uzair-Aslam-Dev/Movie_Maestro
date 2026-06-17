import React, { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "../appwrite";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const loadWishlist = async () => {
    const data = await getWishlist();
    setItems(data);
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (e, id) => {
    e.stopPropagation(); // prevent navigation when clicking remove
    await removeFromWishlist(id);

    // Remove locally without reloading everything
    setItems((prev) => prev.filter((item) => item.$id !== id));
  };

  return (
    <div className="text-white p-6 min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

      {items.length === 0 && (
        <p className="text-gray-500">Your wishlist is empty.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {items.map((movie) => (
          <div
            key={movie.$id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition relative cursor-pointer"
            onClick={() => navigate(`/movie/${movie.movieid}`)}
          >
            <img
              src={movie.poster || "https://via.placeholder.com/500x750?text=No+Image"}
              className="w-full h-64 object-cover"
            />

            <div className="p-3">
              <h2 className="text-sm font-semibold truncate">{movie.title}</h2>
            </div>

            {/* Remove Button */}
            <button
              onClick={(e) => handleRemove(e, movie.$id)}
              className="absolute top-2 right-2 px-2 py-1 text-xs bg-red-600 rounded hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;