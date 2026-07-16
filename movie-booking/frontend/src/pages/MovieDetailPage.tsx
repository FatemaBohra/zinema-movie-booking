import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import type { Movie } from '../components/MovieCard'

interface Showtime {
    showtimeId: string
    movieId: string
    startTime: string
    endTime: string
    hall: string
    totalSeats: number
    availableSeats: number
    ticketPrice: number
}

const MovieDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [movie, setMovie] = useState<Movie | null>(null)
    const [showtimes, setShowtimes] = useState<Showtime[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [movieRes, showtimesRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/movies/${id}`),
                    axios.get(`http://localhost:8080/api/showtimes/movie/${id}`)
                ])
                setMovie(movieRes.data)
                setShowtimes(showtimesRes.data)
            } catch (err) {
                console.error('Error fetching movie details', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (loading) return (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
            Loading...
        </div>
    )

    if (!movie) return (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
            Movie not found
        </div>
    )

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

            {/* Movie header */}
            <div style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '3rem',
                flexWrap: 'wrap',
            }}>
                {/* Poster */}
                <div style={{
                    width: '250px',
                    height: '375px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid var(--border)',
                }}>
                    {movie.posterUrl ? (
                        <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        />
                    ) : (
                        <span style={{ fontSize: '4rem' }}>🎬</span>
                    )}
                </div>

                {/* Movie info */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                    <h1 style={{
                        fontSize: '2.2rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem',
                        color: 'var(--text-primary)',
                    }}>
                        {movie.title}
                    </h1>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span style={{
                            backgroundColor: 'var(--accent)',
                            color: 'var(--text-primary)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                        }}>
                            {movie.genre}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', alignSelf: 'center' }}>
                            ⭐ {movie.rating}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', alignSelf: 'center' }}>
                            {movie.durationMinutes} min
                        </span>
                    </div>

                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        marginBottom: '1rem',
                        lineHeight: '1.6',
                    }}>
                        {movie.description}
                    </p>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                        Director: <span style={{ color: 'var(--text-secondary)' }}>{movie.director}</span>
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Release Date: <span style={{ color: 'var(--text-secondary)' }}>{movie.releaseDate}</span>
                    </p>
                </div>
            </div>

            {/* Showtimes */}
            <div>
                <h2 style={{
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    marginBottom: '1.5rem',
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '0.75rem',
                }}>
                    Available Showtimes
                </h2>

                {showtimes.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No showtimes available for this movie.</p>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '1rem',
                    }}>
                        {showtimes.map(showtime => (
                            <div
                                key={showtime.showtimeId}
                                style={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '1.25rem',
                                    cursor: showtime.availableSeats > 0 ? 'pointer' : 'not-allowed',
                                    opacity: showtime.availableSeats > 0 ? 1 : 0.5,
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                    if (showtime.availableSeats > 0) {
                                        const el = e.currentTarget as HTMLDivElement
                                        el.style.borderColor = 'var(--accent)'
                                    }
                                }}
                                onMouseLeave={e => {
                                    const el = e.currentTarget as HTMLDivElement
                                    el.style.borderColor = 'var(--border)'
                                }}
                                // Navigate to BookingPage
                                onClick={() => {
                                    if (showtime.availableSeats > 0) {
                                        navigate(`/booking/${showtime.showtimeId}`)
                                    }
                                }}
                            >
                                <p style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.5rem',
                                }}>
                                    {new Date(showtime.startTime).toLocaleString()}
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                    Location: {showtime.hall}
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                    {showtime.availableSeats} seats available
                                </p>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <span style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: 'var(--accent)',
                                    }}>
                                        CA${showtime.ticketPrice}
                                    </span>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        color: showtime.availableSeats > 0 ? 'var(--accent)' : 'var(--text-muted)',
                                    }}>
                                        {showtime.availableSeats > 0 ? 'Book Now →' : 'Sold Out'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MovieDetailPage