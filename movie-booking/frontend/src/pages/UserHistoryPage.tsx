import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

interface Booking {
    bookingId: string
    movieId: string
    movieTitle: string
    showtimeId: string
    showtimeTime: string
    hall: string
    seatId: string
    status: string
    totalAmount: number
    createdAt: string
    paymentId: string | null
}

const UserHistoryPage = () => {
    const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } = useAuth0()
    const navigate = useNavigate()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false)
            return
        }

        const fetchBookings = async () => {
            try {
                const token = await getAccessTokenSilently()
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/bookings/my`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                setBookings(res.data)
            } catch (err) {
                setError('Failed to load bookings')
            } finally {
                setLoading(false)
            }
        }

        fetchBookings()
    }, [isAuthenticated])

    const handleCancel = async (bookingId: string) => {
        const confirmed = window.confirm(
            'Are you sure you want to cancel this booking?\n\nPlease note: Your payment will be refunded within 5-10 business days.'
        )

        if (!confirmed) return

        try {
            const token = await getAccessTokenSilently()
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setBookings(prev =>
                prev.map(b => b.bookingId === bookingId ? { ...b, status: 'CANCELLED' } : b)
            )
        } catch (err) {
            setError('Failed to cancel booking')
        }
    }

    if (loading) return (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
            Loading...
        </div>
    )

    if (!isAuthenticated) return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '2rem',
        }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Login to view your bookings
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Your booking history will appear here after you login
            </p>
            <button
                onClick={() => loginWithRedirect()}
                style={{
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    padding: '0.75rem 2rem',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                Login
            </button>
        </div>
    )

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
            }}>
                My Bookings
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Your booking history
            </p>

            {error && (
                <p style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</p>
            )}

            {bookings.length === 0 && !loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                }}>
                    <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎬</p>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        No bookings yet
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            backgroundColor: 'var(--accent)',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Browse Movies
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(booking => (
                    <div
                        key={booking.bookingId}
                        style={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: booking.status === 'CANCELLED' ? 0.6 : 1,
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
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
                            </div>

                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                🎬 <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{booking.movieTitle}</span>
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                {new Date(booking.showtimeTime).toLocaleString()}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                Location: {booking.hall}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Seat: <span style={{ color: 'var(--text-primary)' }}>{booking.seatId}</span>
                            </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <p style={{
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                color: 'var(--accent)',
                                marginBottom: '0.75rem',
                            }}>
                                CA${booking.totalAmount}
                            </p>
                            {booking.status === 'CONFIRMED' && (
                                <button
                                    onClick={() => handleCancel(booking.bookingId)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-secondary)',
                                        padding: '0.4rem 1rem',
                                        borderRadius: '4px',
                                        fontSize: '0.85rem',
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
                                        el.style.color = 'var(--text-secondary)'
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default UserHistoryPage