import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addToWishlist, isMovieInWishlist } from "../appwrite";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);


  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        });
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error("Failed to fetch movie details:", err);
      }
    };

    const fetchSimilarMovies = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/similar`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );
        const data = await res.json();
        setSimilarMovies(data.results || []);
      } catch (err) {
        console.error("Failed to fetch similar movies:", err);
      }
    };

    const fetchTrailer = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/videos`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );
        const data = await res.json();
        const trailer = data.results.find(
          (vid) => vid.type === "Trailer" && vid.site === "YouTube"
        );
        setTrailerKey(trailer?.key || null);
      } catch (err) {
        console.error("Failed to fetch trailer:", err);
      }
    };

    fetchMovieDetails();
    fetchSimilarMovies();
    fetchTrailer();
  }, [id]);

  // Check if movie is already in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!movie) return;
      const exists = await isMovieInWishlist(movie.id);
      setInWishlist(exists);
    };
    checkWishlist();
  }, [movie]);

  const handleAddWishlist = async () => {
    if (inWishlist || !movie) return;
    await addToWishlist({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
    });
    setInWishlist(true);
  };

  if (!movie) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="text-white min-h-screen bg-black">
      {/* Backdrop */}
      <div
        className="w-full h-[60vh] bg-cover bg-center relative"
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            : "none",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Movie Info */}
      <div className="max-w-5xl mx-auto px-6 -mt-40 relative z-10 flex flex-col md:flex-row gap-6">
        <img
          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
          className="w-48 rounded-xl shadow-lg hidden md:block"
        />
        <div>
          <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
          <div className="text-sm text-gray-300 mb-4">
            {movie.release_date?.split("-")[0]} • {movie.runtime} min •{" "}
            {movie.original_language?.toUpperCase()}
          </div>
          <p className="max-w-2xl text-base text-gray-200 leading-relaxed">
            {movie.overview}
          </p>

          <div className="mt-4 flex gap-4 flex-wrap">
            <button
              className="bg-red-600 px-5 py-2 rounded-lg hover:bg-red-700 transition"
              onClick={() => setShowTrailer(!showTrailer)}
            >
              {showTrailer ? "Hide Trailer" : "Watch Trailer"}
            </button>

            <button
              disabled={inWishlist}
              className={`px-5 py-2 rounded-lg text-white transition ${
                inWishlist
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={handleAddWishlist}
            >
              {inWishlist ? "Added" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Trailer */}
      {showTrailer && (
        <div className="max-w-5xl mx-auto px-6 mt-10">
          {trailerKey ? (
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${trailerKey}`}
              className="rounded-xl"
              allowFullScreen
            ></iframe>
          ) : (
            <p className="text-red-400">No trailer available.</p>
          )}
        </div>
      )}

      {/* Similar Movies */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">Similar Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {similarMovies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => navigate(`/movie/${movie.id}`)}
              className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition duration-300"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                className="w-full h-64 object-cover"
              />
              <div className="p-3">
                <h3 className="text-sm font-semibold truncate">{movie.title}</h3>
                <p className="text-xs text-gray-400">
                  {movie.release_date?.split("-")[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
