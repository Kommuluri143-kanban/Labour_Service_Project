import { AuthFlow } from '../../components/AuthFlow.jsx'
import './SignUpPage.css'

export function SignUpPage({ onBack, onSuccess }) {
  return <main className="sign-up-route-page"><AuthFlow mode="signup" onBack={onBack} onSuccess={onSuccess} /></main>
}
