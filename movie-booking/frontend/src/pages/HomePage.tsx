import { useAuth0 } from '@auth0/auth0-react'

const HomePage = () => {
    const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0()

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1>Zinema 🎬</h1>
            {isAuthenticated ? (
                <div>
                    <p>Welcome, {user?.email}!</p>
                    <p>Roles: {JSON.stringify(user?.['https://zinema-api/roles'])}</p>
                    <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                        Logout
                    </button>
                </div>
            ) : (
                <button onClick={() => loginWithRedirect()}>
                    Login
                </button>
            )}
        </div>
    )
}

export default HomePage