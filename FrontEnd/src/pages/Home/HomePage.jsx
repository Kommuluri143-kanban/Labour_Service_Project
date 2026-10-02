import './HomePage.css'

export function HomePage({ onSignIn, onSignUp }) {
  return <main className="welcome-screen">
    <div className="welcome-content">
      <h1><span>WN</span><b>|</b><span>Work<br />Near</span></h1>
      <p className="welcome-links">Already existing user <a href="/SignIn" onClick={(event) => { event.preventDefault(); onSignIn() }}>Sign in</a></p>
      <p className="welcome-links">New user <a href="/SignUp" onClick={(event) => { event.preventDefault(); onSignUp() }}>Sign up</a></p>
    </div>
  </main>
}
