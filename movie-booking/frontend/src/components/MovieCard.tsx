import { useNavigate } from 'react-router-dom'

interface Movie {
    movieId: string
    title: string
    genre: string
    director: string
    durationMinutes: number
    releaseDate: string
    rating: number
    posterUrl: string | null
    description: string
}

interface MovieCardProps {
    movie: Movie
}

const MovieCard = ({ movie }: MovieCardProps) => {
    const navigate = useNavigate()

    return (
        <div
            onClick={() => navigate(`/movies/${movie.movieId}`)}
            style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = 'var(--accent)'
                el.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = 'var(--border)'
                el.style.transform = 'translateY(0)'
            }}
        >
            <div style={{
                width: '100%',
                height: '280px',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}>
                {movie.posterUrl ? (
                    <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <span style={{ fontSize: '3rem' }}>🎬</span>
                )}
            </div>

            <div style={{ padding: '1rem' }}>
                <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {movie.title}
                </h3>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.4rem',
                }}>
                    <span style={{
                        fontSize: '0.8rem',
                        color: 'var(--accent)',
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                    }}>
                        {movie.genre}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        ⭐ {movie.rating}
                    </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {movie.durationMinutes} min · {movie.releaseDate}
                </p>
            </div>
        </div>
    )
}

export default MovieCard
export type { Movie }