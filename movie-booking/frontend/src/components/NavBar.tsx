import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'

const NavBar = () => {
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0()

    return (
        <nav style={{
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            padding: '0 2rem',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <Link to="/" style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--accent)',
                letterSpacing: '2px',
            }}>
                ZINEMA
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Link
                    to="/"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.target as HTMLAnchorElement).style.color = 'var(--accent-hover)'}
                    onMouseLeave={e => (e.target as HTMLAnchorElement).style.color = 'var(--text-secondary)'}
                >
                    Movies
                </Link>

                {isAuthenticated && (
                    <Link
                        to="/history"
                        style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.target as HTMLAnchorElement).style.color = 'var(--accent-hover)'}
                        onMouseLeave={e => (e.target as HTMLAnchorElement).style.color = 'var(--text-secondary)'}
                    >
                        My Bookings
                    </Link>
                )}

                {isAuthenticated && user?.['https://zinema-api/roles']?.includes('admin') && (
                    <Link
                        to="/admin"
                        style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.target as HTMLAnchorElement).style.color = 'var(--accent-hover)'}
                        onMouseLeave={e => (e.target as HTMLAnchorElement).style.color = 'var(--text-secondary)'}
                    >
                        Admin
                    </Link>
                )}

                {isAuthenticated ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border)',
                                color: 'var(--text-secondary)',
                                padding: '0.4rem 1rem',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => {
                                (e.target as HTMLButtonElement).style.borderColor = 'var(--accent)'
                                    ; (e.target as HTMLButtonElement).style.color = 'var(--accent)'
                            }}
                            onMouseLeave={e => {
                                (e.target as HTMLButtonElement).style.borderColor = 'var(--border)'
                                    ; (e.target as HTMLButtonElement).style.color = 'var(--text-secondary)'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => loginWithRedirect()}
                        style={{
                            backgroundColor: 'var(--accent)',
                            color: 'var(--text-primary)',
                            padding: '0.4rem 1.2rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={e => {
                            (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)'
                        }}
                        onMouseLeave={e => {
                            (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent)'
                        }}
                    >
                        Login
                    </button>
                )}
            </div>
        </nav>
    )
}

export default NavBar