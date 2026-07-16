import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
    const navigate = useNavigate()

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            textAlign: 'center',
            padding: '2rem',
        }}>
            <p style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎬</p>
            <h1 style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: 'var(--accent)',
                marginBottom: '0.5rem',
            }}>
                404
            </h1>
            <p style={{
                fontSize: '1.2rem',
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
            }}>
                This scene doesn't exist
            </p>
            <button
                onClick={() => navigate('/')}
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
                Back to Home
            </button>
        </div>
    )
}

export default NotFoundPage