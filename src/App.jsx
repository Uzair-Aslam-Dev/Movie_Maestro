import React, { useState, useEffect } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App() {
  const [searchItem, setSearchItem] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([])
  const [trendingMovies, setTrendingMovies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedSearchItem, setDebouncedSearchItem] = useState('')

  useDebounce(() => setDebouncedSearchItem(searchItem), 500, [searchItem])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endPoint = query ?
        `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :
        `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endPoint, API_OPTIONS)

      if (!response.ok) throw new Error("Failed to fetch movies...")

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setErrorMessage("No movies found for your search.");
        setMovieList([]);
        return;
      }

      // Fire-and-forget update to Appwrite
      if (query && data.results.length > 0) {
        updateSearchCount(query, data.results[0]);
      }

      setMovieList(data.results || []);

    } catch (error) {
      console.error(`Error fetching Movies: ${error}`)
      setErrorMessage("Error Fetching Movies. Please Try Again Later");
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(error);
    }
  }

  const navigate = useNavigate();  
  const handleClick = (movie) => {
    const id = movie.movie_id || movie.id;
    navigate(`/movie/${id}`);
  };

  useEffect(() => {
    fetchMovies(debouncedSearchItem);
  }, [debouncedSearchItem])

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  const isSearching = debouncedSearchItem.trim().length > 0;

  return (
    <main>
      <nav className="fixed top-0 left-0 w-full px-8 py-1 backdrop-blur-md border-b border-white/10 flex justify-between items-center text-white shadow-lg z-50 transition-all duration-300 hover:bg-white/5">
        <div className="flex items-center">
          <h1 className="text-xl font-bold tracking-wider text-white font-sans bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text drop-shadow-lg">
            MOVIE-MAESTRO
          </h1>
        </div>
        <div className="flex gap-6 text-sm font-semibold">
          <a href="#all-movies" className="px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/30">Popular</a>
          <a href="#trending" className="px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/30">Trending</a>
          <a onClick={() => navigate("/wishlist")} className="px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-all cursor-pointer">Wishlist</a>
        </div>
      </nav>

      <div className="pattern" />

      <div className="wrapper pt-16">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchItem={searchItem} setSearchItem={setSearchItem} />
        </header>

        {!isSearching && trendingMovies.length > 0 && (
          <section className='trending scroll-mt-22' id="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id} onClick={()=> handleClick(movie)} className='cursor-pointer hover:scale-105 hover:opacity-80 transition-transform duration-300'>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} loading="lazy" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies scroll-mt-22' id="all-movies">
          <h2>{isSearching ? `Search Results for "${debouncedSearchItem}"` : "Popular"}</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={{...movie, poster_path: `https://image.tmdb.org/t/p/w300${movie.poster_path}`}} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
