import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import type { Movie } from '../components/MovieCard'

interface Booking {
    bookingId: string
    movieTitle: string
    showtimeTime: string
    hall: string
    seatId: string
    status: string
    totalAmount: number
    createdAt: string
    userId: string
}

const AdminPage = () => {
    const { isAuthenticated, user, getAccessTokenSilently } = useAuth0()
    const navigate = useNavigate()

    const [movies, setMovies] = useState<Movie[]>([])
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'movies' | 'showtimes' | 'bookings'>('movies')

    const [newMovie, setNewMovie] = useState({
        title: '',
        description: '',
        genre: '',
        director: '',
        durationMinutes: '',
        releaseDate: '',
        rating: '',
    })

    const [newShowtime, setNewShowtime] = useState({
        movieId: '',
        startTime: '',
        endTime: '',
        hall: '',
        totalSeats: '',
        ticketPrice: '',
    })


    const isAdmin = user?.['https://zinema-api/roles']?.includes('admin')

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            navigate('/')
            return
        }
        fetchMovies()
    }, [isAuthenticated])

    const fetchMovies = async () => {
        try {
            const res = await axios.get('import.meta.env.VITE_API_URL/api/movies')
            setMovies(res.data)
        } catch {
            setError('Failed to load movies')
        } finally {
            setLoading(false)
        }
    }

    const fetchBookings = async () => {
        try {
            const token = await getAccessTokenSilently()
            const res = await axios.get('import.meta.env.VITE_API_URL/api/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setBookings(res.data)
        } catch {
            setError('Failed to load bookings')
        }
    }

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            navigate('/')
            return
        }
        fetchMovies()
        fetchBookings()
    }, [isAuthenticated])

    const handleAddMovie = async () => {
        try {
            setError(null)
            const token = await getAccessTokenSilently()
            await axios.post('import.meta.env.VITE_API_URL/api/movies', {
                ...newMovie,
                durationMinutes: parseInt(newMovie.durationMinutes),
                rating: parseFloat(newMovie.rating),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSuccess('Movie added successfully!')
            setNewMovie({
                title: '', description: '', genre: '',
                director: '', durationMinutes: '', releaseDate: '', rating: ''
            })
            fetchMovies()
        } catch {
            setError('Failed to add movie')
        }
    }

    const handleDeleteMovie = async (movieId: string) => {
        try {
            setError(null)
            const token = await getAccessTokenSilently()
            await axios.delete(`import.meta.env.VITE_API_URL/api/movies/${movieId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSuccess('Movie deleted!')
            fetchMovies()
        } catch {
            setError('Failed to delete movie')
        }
    }

    const handleAddShowtime = async () => {
        try {
            setError(null)
            const token = await getAccessTokenSilently()
            await axios.post('import.meta.env.VITE_API_URL/api/showtimes', {
                ...newShowtime,
                totalSeats: parseInt(newShowtime.totalSeats),
                ticketPrice: parseFloat(newShowtime.ticketPrice),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSuccess('Showtime added successfully!')
            setNewShowtime({
                movieId: '', startTime: '', endTime: '',
                hall: '', totalSeats: '', ticketPrice: ''
            })
        } catch {
            setError('Failed to add showtime')
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '0.6rem 0.8rem',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        outline: 'none',
        marginBottom: '0.75rem',
    }

    const buttonStyle = {
        backgroundColor: 'var(--accent)',
        color: 'white',
        padding: '0.6rem 1.5rem',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    }

    if (loading) return (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
            Loading...
        </div>
    )

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Admin Panel
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Manage movies and showtimes
            </p>

            {error && (
                <p style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>
            )}
            {success && (
                <p style={{ color: '#22c55e', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</p>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {(['movies', 'showtimes', 'bookings'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            border: '1px solid var(--border)',
                            backgroundColor: activeTab === tab ? 'var(--accent)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'movies' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                    {/* Add movie form */}
                    <div style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '1.5rem',
                    }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem' }}>
                            Add New Movie
                        </h2>
                        <input style={inputStyle} placeholder="Title" value={newMovie.title}
                            onChange={e => setNewMovie({ ...newMovie, title: e.target.value })} />
                        <input style={inputStyle} placeholder="Description" value={newMovie.description}
                            onChange={e => setNewMovie({ ...newMovie, description: e.target.value })} />
                        <input style={inputStyle} placeholder="Genre" value={newMovie.genre}
                            onChange={e => setNewMovie({ ...newMovie, genre: e.target.value })} />
                        <input style={inputStyle} placeholder="Director" value={newMovie.director}
                            onChange={e => setNewMovie({ ...newMovie, director: e.target.value })} />
                        <input style={inputStyle} placeholder="Duration (minutes)" value={newMovie.durationMinutes}
                            onChange={e => setNewMovie({ ...newMovie, durationMinutes: e.target.value })} />
                        <input style={inputStyle} placeholder="Release Date (YYYY-MM-DD)" value={newMovie.releaseDate}
                            onChange={e => setNewMovie({ ...newMovie, releaseDate: e.target.value })} />
                        <input style={inputStyle} placeholder="Rating (e.g. 8.5)" value={newMovie.rating}
                            onChange={e => setNewMovie({ ...newMovie, rating: e.target.value })} />
                        <button style={buttonStyle} onClick={handleAddMovie}>
                            Add Movie
                        </button>
                    </div>

                    {/* Movie list */}
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem' }}>
                            All Movies ({movies.length})
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {movies.map(movie => (
                                <div key={movie.movieId} style={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <div>
                                        <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{movie.title}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {movie.genre} · ⭐ {movie.rating} · {movie.durationMinutes} min
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMovie(movie.movieId)}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--border)',
                                            color: 'var(--text-muted)',
                                            padding: '0.3rem 0.75rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => {
                                            const el = e.currentTarget as HTMLButtonElement
                                            el.style.borderColor = 'var(--accent)'
                                            el.style.color = 'var(--accent)'
                                        }}
                                        onMouseLeave={e => {
                                            const el = e.currentTarget as HTMLButtonElement
                                            el.style.borderColor = 'var(--border)'
                                            el.style.color = 'var(--text-muted)'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'showtimes' && (
                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    maxWidth: '500px',
                }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem' }}>
                        Add New Showtime
                    </h2>
                    <select
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        value={newShowtime.movieId}
                        onChange={e => setNewShowtime({ ...newShowtime, movieId: e.target.value })}
                    >
                        <option value="">Select a movie</option>
                        {movies.map(movie => (
                            <option key={movie.movieId} value={movie.movieId}>
                                {movie.title}
                            </option>
                        ))}
                    </select>
                    <input style={inputStyle} placeholder="Start Time (e.g. 2026-07-20T19:30:00)"
                        value={newShowtime.startTime}
                        onChange={e => setNewShowtime({ ...newShowtime, startTime: e.target.value })} />
                    <input style={inputStyle} placeholder="End Time (e.g. 2026-07-20T22:00:00)"
                        value={newShowtime.endTime}
                        onChange={e => setNewShowtime({ ...newShowtime, endTime: e.target.value })} />
                    <input style={inputStyle} placeholder="Hall (e.g. Hall A)"
                        value={newShowtime.hall}
                        onChange={e => setNewShowtime({ ...newShowtime, hall: e.target.value })} />
                    <input style={inputStyle} placeholder="Total Seats (e.g. 100)"
                        value={newShowtime.totalSeats}
                        onChange={e => setNewShowtime({ ...newShowtime, totalSeats: e.target.value })} />
                    <input style={inputStyle} placeholder="Ticket Price (e.g. 12.99)"
                        value={newShowtime.ticketPrice}
                        onChange={e => setNewShowtime({ ...newShowtime, ticketPrice: e.target.value })} />
                    <button style={buttonStyle} onClick={handleAddShowtime}>
                        Add Showtime
                    </button>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem' }}>
                        All Bookings ({bookings.length})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {bookings.length === 0 && (
                            <p style={{ color: 'var(--text-secondary)' }}>No bookings yet</p>
                        )}
                        {bookings.map(booking => (
                            <div key={booking.bookingId} style={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                padding: '1rem 1.25rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                opacity: booking.status === 'CANCELLED' ? 0.6 : 1,
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '4px',
                                            backgroundColor: booking.status === 'CONFIRMED'
                                                ? 'rgba(34, 197, 94, 0.15)'
                                                : 'rgba(255, 107, 107, 0.15)',
                                            color: booking.status === 'CONFIRMED' ? '#22c55e' : 'var(--accent)',
                                        }}>
                                            {booking.status}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {booking.bookingId}
                                        </span>
                                    </div>
                                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{booking.movieTitle}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                        {new Date(booking.showtimeTime).toLocaleString()}
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                        Location: {booking.hall}
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        Seat: {booking.seatId}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: 'var(--accent)',
                                    }}>
                                        CA${booking.totalAmount}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminPage