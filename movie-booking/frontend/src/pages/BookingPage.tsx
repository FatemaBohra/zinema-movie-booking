import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'
import StripeCheckout from '../components/StripeCheckout'

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
    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()

    const [showtime, setShowtime] = useState<Showtime | null>(null)
    const [movie, setMovie] = useState<Movie | null>(null)
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [booking, setBooking] = useState(false)
    const [bookedSeats, setBookedSeats] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)

    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [showCheckout, setShowCheckout] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const showtimeRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/showtimes/${id}`)
                setShowtime(showtimeRes.data)
                const movieRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/movies/${showtimeRes.data.movieId}`)
                setMovie(movieRes.data)
                const seatsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/showtime/${id}/seats`)
                setBookedSeats(seatsRes.data)
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

        if (!showtime) {
            setError('Showtime not found')
            return
        }

        try {
            setBooking(true)
            setError(null)

            const token = await getAccessTokenSilently()

            // Create payment intent
            const paymentRes = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payments/create-payment-intent?amount=${showtime.ticketPrice}&currency=cad`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setClientSecret(paymentRes.data.clientSecret)
            setShowCheckout(true)
        } catch (err) {
            console.error('Error creating payment intent:', err)
            setError('Failed to initiate payment. Please try again.')
        } finally {
            setBooking(false)
        }
    }

    const handlePaymentSuccess = async (confirmedPaymentIntentId: string) => {
        try {
            const token = await getAccessTokenSilently()
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/bookings?showtimeId=${id}&seatId=${selectedSeat}&paymentIntentId=${confirmedPaymentIntentId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            navigate('/history')
        } catch (err) {
            setError('Payment succeeded but booking failed. Please contact support.')
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
                        {new Date(showtime.startTime).toLocaleString()}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        Location: {showtime.hall}
                    </p>
                    <p style={{ color: 'var(--accent)', fontSize: '1rem', fontWeight: '600' }}>
                        CA${showtime.ticketPrice} per seat
                    </p>
                </div>
            </div>

            {/* Not logged in banner */}
            {!isAuthenticated && (
                <div style={{
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    border: '1px solid var(--accent)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        You need to login to complete your booking
                    </p>
                    <button
                        onClick={() => loginWithRedirect()}
                        style={{
                            backgroundColor: 'var(--accent)',
                            color: 'white',
                            padding: '0.4rem 1rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Login
                    </button>
                </div>
            )}

            {/* Screen */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
                            const isBooked = bookedSeats.includes(seatId)

                            return (
                                <div
                                    key={seatId}
                                    onClick={() => {
                                        if (!isBooked) setSelectedSeat(isSelected ? null : seatId)
                                    }}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '4px 4px 0 0',
                                        backgroundColor: isBooked
                                            ? 'var(--text-muted)'
                                            : isSelected
                                                ? 'var(--accent)'
                                                : 'var(--bg-secondary)',
                                        border: `1px solid ${isBooked
                                            ? 'var(--text-muted)'
                                            : isSelected
                                                ? 'var(--accent)'
                                                : 'var(--border)'
                                            } `,
                                        cursor: isBooked ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.65rem',
                                        color: isBooked ? 'var(--bg-secondary)' : isSelected ? 'white' : 'var(--text-muted)',
                                        transition: 'all 0.15s',
                                        opacity: isBooked ? 0.5 : 1,
                                    }}
                                    onMouseEnter={e => {
                                        if (!isSelected && !isBooked) {
                                            const el = e.currentTarget as HTMLDivElement
                                            el.style.backgroundColor = 'var(--border-hover)'
                                            el.style.borderColor = 'var(--accent)'
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isSelected && !isBooked) {
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '20px', height: '20px',
                        backgroundColor: 'var(--text-muted)',
                        borderRadius: '3px',
                        opacity: 0.5,
                    }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Taken</span>
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
                    {booking ? 'Processing...' : isAuthenticated ? 'Book Now' : 'Login to Book'}
                </button>
            </div>
            {showCheckout && clientSecret && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem',
                }}>
                    <div style={{ width: '100%', maxWidth: '480px' }}>
                        <StripeCheckout
                            clientSecret={clientSecret}
                            onSuccess={handlePaymentSuccess}
                            onCancel={() => {
                                setShowCheckout(false)
                                setClientSecret(null)
                            }}
                            amount={showtime?.ticketPrice || 0}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default BookingPage