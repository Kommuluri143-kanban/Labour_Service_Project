import { AuthFlow } from '../../components/AuthFlow.jsx'
import './SignInPage.css'

export function SignInPage({ onBack, onSuccess }) {
  return <main className="sign-in-route-page"><AuthFlow mode="signin" onBack={onBack} onSuccess={onSuccess} /></main>
}
