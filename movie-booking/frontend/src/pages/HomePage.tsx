import { useState, useEffect } from 'react'
import axios from 'axios'
import MovieCard from '../components/MovieCard'
import type { Movie } from '../components/MovieCard'

const HomePage = () => {
    const [movies, setMovies] = useState<Movie[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        axios.get('import.meta.env.VITE_API_URL/api/movies')
            .then(res => {
                setMovies(res.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load movies')
                setLoading(false)
            })
    }, [])

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(search.toLowerCase()) ||
        movie.genre.toLowerCase().includes(search.toLowerCase()) ||
        movie.director.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)',
                }}>
                    Now Showing
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Browse and book your favourite movies
                </p>
            </div>

            <input
                type="text"
                placeholder="Search by title, genre or director..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    marginBottom: '2rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />

            {loading && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
                    Loading movies...
                </div>
            )}

            {error && (
                <div style={{ textAlign: 'center', color: 'var(--accent)', padding: '4rem' }}>
                    {error}
                </div>
            )}

            {!loading && !error && filteredMovies.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
                    No movies found
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1.5rem',
            }}>
                {filteredMovies.map(movie => (
                    <MovieCard key={movie.movieId} movie={movie} />
                ))}
            </div>
        </div>
    )
}

export default HomePage