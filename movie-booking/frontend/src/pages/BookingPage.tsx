import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'

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

interface Movie {
    movieId: string
    title: string
    genre: string
    posterUrl: string | null
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const SEATS_PER_ROW = 10

const BookingPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated, loginWithRedirect, user, getAccessTokenSilently } = useAuth0()

    const [showtime, setShowtime] = useState<Showtime | null>(null)
    const [movie, setMovie] = useState<Movie | null>(null)
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [booking, setBooking] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const showtimeRes = await axios.get(`http://localhost:8080/api/showtimes/${id}`)
                setShowtime(showtimeRes.data)
                const movieRes = await axios.get(`http://localhost:8080/api/movies/${showtimeRes.data.movieId}`)
                setMovie(movieRes.data)
            } catch (err) {
                setError('Failed to load showtime details')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleBooking = async () => {
        if (!isAuthenticated) {
            loginWithRedirect()
            return
        }

        if (!selectedSeat) {
            setError('Please select a seat')
            return
        }

        try {
            setBooking(true)
            setError(null)

            // this gets the Auth0 JWT token and sends it in the Authorization header 
            // so Spring Boot can validate it.
            const token = await getAccessTokenSilently()
            // To avoid "Invalid character" error — the "| in auth0|6a5649..." in URLs
            // URL encode is needed!
            const userId = encodeURIComponent(user?.sub || 'USER-123')

            await axios.post(
                `http://localhost:8080/api/bookings?userId=${userId}&showtimeId=${id}&seatId=${selectedSeat}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            navigate('/history')
        } catch (err) {
            console.error('Booking error:', err)
            setError('Booking failed. Please try again.')
        } finally {
            setBooking(false)
        }
    }

    if (loading) return (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
            Loading...
        </div>
    )

    if (!showtime || !movie) return (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
            Showtime not found
        </div>
    )

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>

            {/* Header */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
            }}>
                <div style={{
                    width: '80px',
                    height: '120px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                        <span style={{ fontSize: '2rem' }}>🎬</span>
                    )}
                </div>

                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        {movie.title}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        📅 {new Date(showtime.startTime).toLocaleString()}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        Location: {showtime.hall}
                    </p>
                    <p style={{ color: 'var(--accent)', fontSize: '1rem', fontWeight: '600' }}>
                        CA${showtime.ticketPrice} per seat
                    </p>
                </div>
            </div>

            {/* Screen */}
            <div style={{
                textAlign: 'center',
                marginBottom: '2rem',
            }}>
                <div style={{
                    height: '8px',
                    backgroundColor: 'var(--accent)',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                    opacity: 0.6,
                }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SCREEN</p>
            </div>

            {/* Seat grid */}
            <div style={{ marginBottom: '2rem' }}>
                {ROWS.map(row => (
                    <div key={row} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                    }}>
                        <span style={{
                            width: '20px',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            textAlign: 'right',
                        }}>
                            {row}
                        </span>
                        {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                            const seatId = `${row}${i + 1}`
                            const isSelected = selectedSeat === seatId
                            return (
                                <div
                                    key={seatId}
                                    onClick={() => setSelectedSeat(isSelected ? null : seatId)}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '4px 4px 0 0',
                                        backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-secondary)',
                                        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.65rem',
                                        color: isSelected ? 'white' : 'var(--text-muted)',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => {
                                        if (!isSelected) {
                                            const el = e.currentTarget as HTMLDivElement
                                            el.style.backgroundColor = 'var(--border-hover)'
                                            el.style.borderColor = 'var(--accent)'
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isSelected) {
                                            const el = e.currentTarget as HTMLDivElement
                                            el.style.backgroundColor = 'var(--bg-secondary)'
                                            el.style.borderColor = 'var(--border)'
                                        }
                                    }}
                                >
                                    {i + 1}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                marginBottom: '2rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '20px', height: '20px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '3px',
                    }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '20px', height: '20px',
                        backgroundColor: 'var(--accent)',
                        borderRadius: '3px',
                    }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Selected</span>
                </div>
            </div>

            {/* Error */}
            {error && (
                <p style={{
                    color: 'var(--accent)',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                }}>
                    {error}
                </p>
            )}

            {/* Summary + Book button */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div>
                    {selectedSeat ? (
                        <>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Selected seat: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedSeat}</span>
                            </p>
                            <p style={{ color: 'var(--accent)', fontSize: '1.1rem', fontWeight: '700' }}>
                                Total: CA${showtime.ticketPrice}
                            </p>
                        </>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Select a seat to continue
                        </p>
                    )}
                </div>

                <button
                    onClick={handleBooking}
                    disabled={!selectedSeat || booking}
                    style={{
                        backgroundColor: selectedSeat ? 'var(--accent)' : 'var(--bg-secondary)',
                        color: selectedSeat ? 'white' : 'var(--text-muted)',
                        padding: '0.75rem 2rem',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: selectedSeat ? 'pointer' : 'not-allowed',
                        border: 'none',
                        transition: 'all 0.2s',
                    }}
                >
                    {booking ? 'Booking...' : isAuthenticated ? 'Book Now' : 'Login to Book'}
                </button>
            </div>
        </div>
    )
}

export default BookingPage