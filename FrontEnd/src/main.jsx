import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, LogOut, Menu, Mic, MicOff, Pencil, QrCode, RefreshCw, Search, ShieldCheck, UserRound, X } from 'lucide-react'
import './styles.css'

const categories = [
  { name: 'Electricians', icon: '⚡', count: '18 nearby teams' },
  { name: 'Vehicle & Machinery Repairs', icon: '🔧', count: '11 nearby teams' },
  { name: 'Farming & Daily Wage Service Providers', icon: '🌾', count: '22 nearby teams' },
  { name: 'Painters', icon: '🎨', count: '9 nearby teams' },
  { name: 'Plumbers', icon: '🚰', count: '14 nearby teams' },
  { name: 'Carpenters', icon: '🪚', count: '7 nearby teams' },
  { name: 'Construction Service Providers', icon: '🏗️', count: '5 nearby teams' },
  { name: 'Marriage & Other Functions Service Providers', icon: '🎊', count: '12 nearby teams' },
  { name: 'Other Service Providers', icon: '🧰', count: '16 nearby teams' },
]

const labourTypes = [
  'Electricians',
  'Vehicle & Machinery Repairs',
  'Farming & Daily Wage Service Providers',
  'Painters',
  'Plumbers',
  'Carpenters',
  'Construction Service Providers',
  'Marriage & Other Functions Service Providers',
  'Other Service Providers',
]
const marriageFunctionSpecialists = [
  { name: 'Caterers', description: 'Food preparation and serving staff' },
  { name: 'Cleaning Staff', description: 'Venue maintenance before/after events' },
  { name: 'Decorators', description: 'Stage, mandap, and venue decoration' },
  { name: 'Lighting Technicians', description: 'Venue lighting setup' },
  { name: 'Makeup Artists', description: 'Bridal and guest makeup services' },
  { name: 'Musicians', description: 'Bands, DJs, traditional instrumentalists' },
  { name: 'Photographers', description: 'Photography and videography services' },
  { name: '<===============================>', divider: true },
  { name: '★ Specialist', value: 'Specialist', description: 'All' },
]
const constructionSpecialists = [
  { name: 'Carpenters', description: 'Shuttering, wooden molds, and joinery work' },
  { name: 'Centring Fixers', description: 'Placing reinforcement bars before concreting' },
  { name: 'Concrete Workers', description: 'Mixing, pouring, and finishing concrete' },
  { name: 'Construction Laborers', description: 'Assisting skilled workers, carrying materials, site prep' },
  { name: 'Electricians', description: 'Wiring and electrical systems in buildings' },
  { name: 'Masons', description: 'Bricklaying, blockwork, and cement plastering' },
  { name: 'Painters', description: 'Surface finishing and painting after cement work' },
  { name: 'Plumbers', description: 'Installing pipelines through cement structures' },
  { name: 'Tile Setters', description: 'Fixing tiles with mortar or adhesives' },
  { name: 'Welders', description: 'Metal fabrication and structural welding' },
  { name: '<===============================>', divider: true },
  { name: '★ Specialist', value: 'Specialist', description: 'Masons + Construction Laborers' },
]
const mandalVillages = {
  Atmakur: ['Aravedu', 'Atmakur', 'Bandarupalle', 'Battepadu', 'Botikarlapadu', 'Boyila Chiruvella', 'Chiruvella Khandrika', 'Depuru', 'Gandlavedu', 'Jangalapalle', 'Kanupurupalle', 'Karatampadu', 'Mahimalur', 'Murugalla', 'Nabbinagaram', 'Nagulapadu', 'Nallapareddipalli', 'Narampeta', 'Nellorepalem', 'Nuvvurupadu', 'Padakandla', 'Pamidipadu', 'Ramaswami Palli', 'Ravvalakollu', 'Vasili', 'Vennawada'],
  Marripadu: ['Allampadu', 'Bheemavaram', 'Brahmanapalle', 'Budawada', 'Chabolu', 'Chilakapadu', 'Chinamachanur', 'Chunchulur', 'Dharmarao Cheruvupalle', 'Irlapadu', 'Kadirinenipalle', 'Kampasamudram', 'Marripadu', 'Nagarajupadu', 'Naginenigunta', 'Nandavaram', 'Neradanampadu', 'Padamatinaidupalle', 'Pallavolu', 'Pegallapadu', 'Ponguru', 'Pongurukandriga', 'Ramanaidupalli', 'Singanapalle', 'Yepiligunta'],
  Vinjamur: ['Bukkapuram', 'Chakalakonda', 'Chandrapadia', 'Chinthalapalem', 'Gundemadakala', 'Janardhanapuram', 'Katepalle', 'Kistipuram', 'Nallagonda', 'Nandigunta', 'Ravipadu', 'Sankavaram', 'Thamidapadu', 'Utukuru', 'Vinjamur'],
}
const mandals = Object.keys(mandalVillages)
const paymentScenarios = [
  { id: 'customer-to-app', label: 'Customer → Platform → Service Provider', methods: ['QR scan'] },
  { id: 'provider-to-app', label: 'Customer → Service Provider → Platform', methods: ['QR scan', 'Cash in hand'] },
]
const formPaths = {
  admin: '/Admin',
  contact: '/ContactUs',
  customer: '/CustomerRequest',
  feedback: '/Feedback',
  labour: '/ServiceProviderRegistration',
  payment: '/PaymentExchange',
}
const adminViewPaths = {
  providers: '/Admin/ServiceProvidersManagement',
  payments: '/Admin/PaymentStatus',
  'service-providers': '/Admin/ServiceProviders',
}

function getRouteState(pathname = window.location.pathname) {
  const path = pathname.toLowerCase()
  if (path === '/signin') return { entryScreen: 'signin', activeForm: null, submitted: false, adminView: 'providers' }
  if (path === '/signup') return { entryScreen: 'signup', activeForm: null, submitted: false, adminView: 'providers' }
  if (path === '/signout') return { entryScreen: 'signout', activeForm: null, submitted: false, adminView: 'providers' }
  if (path === '/admin/paymentstatus') return { entryScreen: 'app', activeForm: 'admin', submitted: true, adminView: 'payments' }
  if (path === '/admin/serviceproviders') return { entryScreen: 'app', activeForm: 'admin', submitted: true, adminView: 'service-providers' }
  if (path === '/admin/serviceprovidersmanagement') return { entryScreen: 'app', activeForm: 'admin', submitted: true, adminView: 'providers' }
  if (path === '/admin') return { entryScreen: 'app', activeForm: 'admin', submitted: false, adminView: 'providers' }

  const formRoute = Object.entries(formPaths).find(([, routePath]) => routePath.toLowerCase() === path)
  if (formRoute) return { entryScreen: 'app', activeForm: formRoute[0], submitted: false, adminView: 'providers' }
  if (path === '/home') return { entryScreen: 'app', activeForm: null, submitted: false, adminView: 'providers' }
  return { entryScreen: 'landing', activeForm: null, submitted: false, adminView: 'providers' }
}

function pushPath(path) {
  if (window.location.pathname !== path) window.history.pushState({}, '', path)
}

function App() {
  const initialRoute = useRef(getRouteState()).current
  const [entryScreen, setEntryScreen] = useState(initialRoute.entryScreen)
  const [activeForm, setActiveForm] = useState(initialRoute.activeForm)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [submitted, setSubmitted] = useState(initialRoute.submitted)
  const [signedIn, setSignedIn] = useState(false)
  const [providerAvailability, setProviderAvailability] = useState('Active')
  const [adminInitialView, setAdminInitialView] = useState(initialRoute.adminView)

  const applyRouteState = (routeState) => {
    setEntryScreen(routeState.entryScreen)
    setActiveForm(routeState.activeForm)
    setSubmitted(routeState.submitted)
    setAdminInitialView(routeState.adminView)
    setMenuOpen(false)
    setProfileOpen(false)
  }

  const navigateTo = (path) => {
    pushPath(path)
    applyRouteState(getRouteState(path))
  }

  const openForm = (form) => {
    pushPath(formPaths[form] || '/Home')
    setSubmitted(false)
    setActiveForm(form)
    setEntryScreen('app')
    setMenuOpen(false)
    setProfileOpen(false)
  }

  const closeForm = () => {
    pushPath('/Home')
    setSubmitted(false)
    setActiveForm(null)
  }

  const handleAdminSuccess = () => {
    setAdminInitialView('providers')
    pushPath(adminViewPaths.providers)
  }

  const handleAdminViewChange = (view) => {
    setAdminInitialView(view)
    pushPath(adminViewPaths[view] || adminViewPaths.providers)
  }

  const handleHomeSignOut = () => {
    setSignedIn(false)
    navigateTo('/')
  }

  const handleAdminSignOut = () => {
    setSignedIn(false)
    navigateTo('/Home')
  }

  useEffect(() => {
    const handlePopState = () => applyRouteState(getRouteState())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (entryScreen === 'landing') return <WelcomeScreen onSignIn={() => navigateTo('/SignIn')} onSignUp={() => navigateTo('/SignUp')} />
  if (entryScreen === 'signout') return <SignOutScreen onHome={() => navigateTo('/')} onSignIn={() => navigateTo('/SignIn')} />
  if (entryScreen === 'signin' || entryScreen === 'signup') return <SignInFlow mode={entryScreen} onBack={() => navigateTo('/')} onSuccess={() => { setSignedIn(true); navigateTo('/Home') }} />

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="WorkNear home">
          <span className="brand-mark"><img src="/src/WN_Logo.png" alt="" /></span>
          <span>WorkNear</span>
        </a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <a href="#categories" onClick={() => setMenuOpen(false)}>Find a service</a>
          <button className="nav-cta" onClick={() => openForm('labour')}>Join as a service provider</button>
          <button className="nav-cta contact-cta" onClick={() => openForm('contact')}>Contact Us</button>
          <button className="nav-cta feedback-cta" onClick={() => openForm('feedback')}>Feedback</button>
          <button className="text-button" onClick={() => openForm('admin')}>Admin</button>
        </nav>
        <div className="profile-area">
          <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen} aria-controls="profile-panel">
            <span className="profile-trigger-avatar"><UserRound size={17} /></span>
            <span className="profile-trigger-copy"><strong>{signedIn ? 'My profile' : 'Profile'}</strong><small>{signedIn ? 'Signed in' : 'View details'}</small></span>
            <ChevronDown size={16} className={profileOpen ? 'profile-chevron open' : 'profile-chevron'} />
          </button>
          <button className="profile-signout" onClick={handleHomeSignOut}>Sign out</button>
          {profileOpen && <ProfilePanel availability={providerAvailability} onAvailabilityChange={setProviderAvailability} onSignOut={handleHomeSignOut} onClose={() => setProfileOpen(false)} />}
        </div>
      </header>

      <div className="page-layout">
        <section className="category-section" id="categories">
          <div className="service-area"><p className="eyebrow">Service area</p><h2>3 mandals covered</h2><p>SPSR Nellore District, Andhra Pradesh</p>{mandals.map((mandal) => <strong key={mandal}>{mandal} · {mandalVillages[mandal].length} villages</strong>)}</div>
          <div className="section-heading"><div><p className="eyebrow">Browse the board</p><h2>All services</h2></div></div>
          <div className="category-grid">
            {categories.map((category) => <button className="category-card" key={category.name} onClick={() => openForm('customer')}><span className="category-icon">{category.icon}</span><span className="category-name">{category.name}</span><span className="category-count">{category.count}</span><ArrowRight className="card-arrow" size={17} /></button>)}
          </div>
        </section>

        <div className="main-content">
          <section className="hero" id="top">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-dot" />Required Services Near You</p>
              <h1>Useful hands,<br /><em>right nearby.</em></h1>
              <p className="hero-description">A simple local board for finding capable help and sharing the work you know best, one practical job at a time.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => openForm('customer')}>Ask a Service<ArrowRight size={18} /></button>
                <button className="secondary-button" onClick={() => openForm('labour')}>Service Provider<img className="service-provider-icon" src="/src/Service_Provider_Img.png" alt="" /></button>
              </div>
              <div className="payment-panel">
                <p className="eyebrow">Secure settlement</p>
                <button className="payment-button" onClick={() => openForm('payment')}>Payment Exchange</button>
                <span>Track customer payment, service provider payout instantly.</span>
              </div>
              <div className="trust-row">
                <div className="avatar-stack" aria-hidden="true"><span>R</span><span>S</span><span>M</span><span>+</span></div>
                <span><strong>64</strong> service providers listed</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="image-frame">
                <img src="/src/Workers.png" alt="Local workers preparing tools for a repair" />
                <div className="image-caption"><span className="status-dot" /> Profiles checked by the community <ShieldCheck size={16} /></div>
              </div>
            </div>
          </section>

          <footer><span>© 2026 WorkNear</span><span>A small board for useful work</span></footer>
        </div>
      </div>

      {activeForm && <RegistrationModal type={activeForm} submitted={submitted} setSubmitted={setSubmitted} onSignedIn={() => setSignedIn(true)} onSignOut={handleAdminSignOut} onClose={closeForm} initialAdminView={adminInitialView} onAdminSuccess={handleAdminSuccess} onAdminViewChange={handleAdminViewChange} />}
    </main>
  )
}

function WelcomeScreen({ onSignIn, onSignUp }) {
  return <main className="welcome-screen">
    <div className="welcome-content">
      <h1><span>WN</span><b>|</b><span>Work<br />Near</span></h1>
      <p className="welcome-links">Already existing user <a href="#sign-in" onClick={(event) => { event.preventDefault(); onSignIn() }}>Sign in</a></p>
      <p className="welcome-links">New user <a href="#sign-up" onClick={(event) => { event.preventDefault(); onSignUp() }}>Sign up</a></p>
    </div>
  </main>
}

function SignOutScreen({ onHome, onSignIn }) {
  return <main className="welcome-screen">
    <div className="welcome-content">
      <h1><span>WN</span><b>|</b><span>Work<br />Near</span></h1>
      <p className="welcome-links">You have signed out.</p>
      <p className="welcome-links"><a href="/" onClick={(event) => { event.preventDefault(); onHome() }}>Back to home</a></p>
      <p className="welcome-links"><a href="/SignIn" onClick={(event) => { event.preventDefault(); onSignIn() }}>Sign in again</a></p>
    </div>
  </main>
}

function SignInFlow({ mode, onBack, onSuccess }) {
  const [selectedService, setSelectedService] = useState('')
  const [selectedMandal, setSelectedMandal] = useState('')
  const [mobile, setMobile] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaCode, setCaptchaCode] = useState(() => Math.random().toString(36).slice(2, 7).toUpperCase())
  const [captchaError, setCaptchaError] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  const refreshCaptcha = () => {
    setCaptchaCode(Math.random().toString(36).slice(2, 7).toUpperCase())
    setCaptchaAnswer('')
    setCaptchaError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!generatedOtp) {
      if (captchaAnswer.trim().toUpperCase() !== captchaCode) {
        setCaptchaError('CAPTCHA does not match.')
        return
      }
      const nextOtp = String(Math.floor(100000 + Math.random() * 900000))
      setGeneratedOtp(nextOtp)
      setOtp('')
      return
    }
    if (!/^\d{6}$/.test(otp)) {
      setOtpError('Enter the correct 6-digit OTP.')
      return
    }
    onSuccess()
  }

  return <main className="signin-screen">
    <section className="signin-panel">
      <p className="eyebrow">WorkNear access</p>
      <h1>{generatedOtp ? 'Verify OTP' : mode === 'signup' ? 'Sign up' : 'Sign in'}</h1>
      <p className="signin-intro">{generatedOtp ? `Enter the six-digit OTP sent to ${mobile}.` : 'Choose a service to continue to the local work board.'}</p>
      <form onSubmit={handleSubmit}>
        {!generatedOtp && <>
          {mode === 'signup' && <>
            <label>User Full Name<input required type="text" value={selectedService} onChange={(event) => setSelectedService(event.target.value)} placeholder="Enter your full name" /></label>
          </>}
          <label>Mobile Number<input required type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="Enter mobile number" /></label>
          <div className="captcha-field"><span>CAPTCHA</span><div className="captcha-code-row"><strong>{captchaCode}</strong><button className="captcha-refresh" type="button" onClick={refreshCaptcha} aria-label="Refresh CAPTCHA" title="Refresh CAPTCHA"><RefreshCw size={15} /></button></div><input required type="text" value={captchaAnswer} onChange={(event) => { setCaptchaAnswer(event.target.value); setCaptchaError('') }} placeholder="Enter CAPTCHA" aria-label="Enter CAPTCHA" />{captchaError && <small>{captchaError}</small>}</div>
        </>}
        {generatedOtp && <label>One-time password<input required autoFocus type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, '')); setOtpError('') }} placeholder="Enter 6-digit OTP" />{otpError && <small className="otp-error">{otpError}</small>}</label>}
        <button className="primary-button form-submit" type="submit">{generatedOtp ? 'Verify OTP' : 'Continue to OTP'} <ArrowRight size={18} /></button>
        <button className="signin-back" type="button" onClick={onBack}>&lt;- Back</button>
      </form>
    </section>
  </main>
}

function ProfilePanel({ availability, onAvailabilityChange, onSignOut, onClose }) {
  const [role, setRole] = useState('Service Provider')
  const [name, setName] = useState('Suresh Kumar')
  const [mobile, setMobile] = useState('90000 12345')
  const [draftAvailability, setDraftAvailability] = useState(availability)
  const [image, setImage] = useState('/src/Service_Provider_Img.png')
  const fallbackImage = role === 'Service Provider' ? '/src/Service_Provider_Img.png' : '/src/Workers.png'

  const handleRoleChange = (event) => {
    const nextRole = event.target.value
    setRole(nextRole)
    setImage(nextRole === 'Service Provider' ? '/src/Service_Provider_Img.png' : '/src/Workers.png')
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  return <section className="profile-panel" id="profile-panel" aria-label="Profile details">
    <div className="profile-panel-heading"><div><p className="eyebrow">Your account</p><h2>Profile details</h2></div><div className="profile-panel-actions"><button className="profile-signout-heading" onClick={onSignOut}>Sign out</button><button className="profile-close" onClick={onClose} aria-label="Close profile"><X size={17} /></button></div></div>
    <div className="profile-preview">
      <img src={image || fallbackImage} alt={`${role} profile`} />
      <div><strong>{name || 'Your name'}</strong><span>{role}</span><small>{mobile || 'Mobile Number'}</small></div>
    </div>
    <div className="profile-fields">
      <label>Profile type<select value={role} onChange={handleRoleChange}><option>Customer</option><option>Service Provider</option></select><ChevronDown className="select-icon" size={16} /></label>
      <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" /></label>
      <label>Mobile number<input value={mobile} onChange={(event) => setMobile(event.target.value)} type="tel" placeholder="Enter mobile number" /></label>
      <label className="image-upload">Profile image<input type="file" accept="image/*" onChange={handleImageChange} /></label>
      {role === 'Service Provider' && <><label>Request status<select value={draftAvailability} onChange={(event) => setDraftAvailability(event.target.value)}><option>Active</option><option>Inactive</option></select><ChevronDown className="select-icon" size={16} /></label><button className="profile-update" type="button" onClick={() => onAvailabilityChange(draftAvailability)}>Update</button></>}
    </div>
    <div className={role === 'Service Provider' && availability === 'Active' ? 'availability-note active' : 'availability-note'}><span className="status-dot" />{role === 'Service Provider' ? availability === 'Active' ? 'Accepting new service requests' : 'Not accepting service requests' : 'Customer profile ready'}</div>
  </section>
}

function RegistrationModal({ type, submitted, setSubmitted, onSignedIn, onSignOut, onClose, initialAdminView, onAdminSuccess, onAdminViewChange }) {
  const isLabour = type === 'labour'
  const isContact = type === 'contact'
  const isFeedback = type === 'feedback'
  const isAdmin = type === 'admin'
  const isPayment = type === 'payment'
  const isCustomer = type === 'customer'
  const [selectedMandal, setSelectedMandal] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [providerName, setProviderName] = useState('')
  const [customerNeed, setCustomerNeed] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const recognitionRef = useRef(null)
  const [adminOtp, setAdminOtp] = useState('')
  const [adminOtpStep, setAdminOtpStep] = useState(false)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaCode, setCaptchaCode] = useState(() => Math.random().toString(36).slice(2, 7).toUpperCase())
  const [captchaError, setCaptchaError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [amount, setAmount] = useState('2500')
  const [commissionRate, setCommissionRate] = useState('10')
  const [paymentScenario, setPaymentScenario] = useState('customer-to-app')
  const [paymentMethod, setPaymentMethod] = useState('QR scan')

  const refreshCaptcha = () => {
    setCaptchaCode(Math.random().toString(36).slice(2, 7).toUpperCase())
    setCaptchaAnswer('')
    setCaptchaError('')
  }

  useEffect(() => {
    if (!isAdmin || adminOtpStep) return undefined
    const refreshTimer = window.setInterval(refreshCaptcha, 60 * 1000)
    return () => window.clearInterval(refreshTimer)
  }, [isAdmin, adminOtpStep])

  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser.')
      return
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim()

      if (transcript) {
        setCustomerNeed(transcript)
        setVoiceError('')
      }
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => {
      setVoiceError('Voice input is unavailable right now.')
      setIsListening(false)
    }

    recognitionRef.current = recognition
    setIsListening(true)
    setVoiceError('')
    recognition.start()
  }

  const numericAmount = Number(amount || 0)
  const numericRate = Number(commissionRate || 0)
  const appCommission = numericAmount * numericRate / 100
  const providerPayout = numericAmount - appCommission
  const activeScenarioMethods = paymentScenarios.find((scenario) => scenario.id === paymentScenario)?.methods || []
  const customerPays = paymentScenario === 'customer-to-app' || paymentScenario === 'provider-to-app' ? numericAmount : 0
  const appCollects = paymentScenario === 'customer-to-app' ? appCommission : paymentScenario === 'provider-to-app' ? appCommission : 0
  const providerReceives = paymentScenario === 'customer-to-app' || paymentScenario === 'provider-to-app' ? providerPayout : 0
  const customerPaysLabel = paymentScenario === 'customer-to-app' ? 'Customer pays → Platform' : 'Customer pays → Service Provider'
  const settlementLabel = paymentScenario === 'customer-to-app' ? 'Platform pays → Service Provider' : 'Service Provider pays → Platform'
  const settlementAmount = paymentScenario === 'customer-to-app' ? providerPayout : appCommission
  const handleAdminBack = () => {
    if (adminOtpStep) {
      setAdminOtpStep(false)
      setAdminOtp('')
      setOtpError('')
      return
    }
    onClose()
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className={isAdmin ? 'modal admin-modal' : 'modal'} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      {!isAdmin && <button className="close-button" onClick={onClose} aria-label="Close registration form"><X size={20} /></button>}
      {submitted ? <div className="success-state admin-dashboard">
        <span className="success-icon"><Check size={26} /></span>
        <p className="eyebrow">{isPayment ? 'Payment complete' : isAdmin ? 'Admin dashboard' : isFeedback ? 'Feedback received' : isContact ? 'Message received' : 'You’re on the list'}</p>
        <h2>{isPayment ? 'Payment exchange success' : isAdmin ? 'Hello, Admin.' : isFeedback ? 'Thanks for your feedback.' : isContact ? 'Thanks for contacting us.' : 'Thanks for reaching out.'}</h2>
        {isPayment ? <div className="payment-summary">
          <div><span>Flow</span><strong>{paymentScenarios.find((scenario) => scenario.id === paymentScenario)?.label}</strong></div>
          <div><span>Method</span><strong>{paymentMethod}</strong></div>
          <div><span>{customerPaysLabel}</span><strong>₹{customerPays.toLocaleString('en-IN')}</strong></div>
          <div><span>Provider receives</span><strong>₹{providerReceives.toLocaleString('en-IN')}</strong></div>
          <div><span>Platform fee</span><strong>₹{appCollects.toLocaleString('en-IN')}</strong></div>  
          <div><span>{settlementLabel}</span><strong>₹{settlementAmount.toLocaleString('en-IN')}</strong></div>
        </div> : isAdmin ? <AdminDashboard initialView={initialAdminView} onViewChange={onAdminViewChange} onSignOut={onSignOut} /> : <p>{isFeedback ? 'Your thoughts help us improve the local work board.' : isContact ? 'We’ve received your message and will get back to you shortly.' : 'We’ve received your details and will be in touch shortly.'}</p>}
        {!isAdmin && <button className="primary-button" onClick={onClose}>Back to home <ArrowRight size={18} /></button>}
      </div> : <><p className="eyebrow">{isPayment ? 'Secure transfer' : isAdmin ? adminOtpStep ? 'Mobile verification' : 'Secure access' : isFeedback ? 'Help us improve' : isContact ? 'Get in touch' : isLabour ? 'Join the network' : 'Find the right help'}</p><h2 id="modal-title">{isPayment ? 'Payment Exchange' : isAdmin ? adminOtpStep ? 'Enter your OTP' : 'Admin login' : isFeedback ? 'Tell us what you think' : isContact ? 'How can we help?' : isLabour ? 'Register as a service provider' : 'Tell us what you need'}</h2><p className="modal-intro">{isPayment ? 'Choose the payment flow, method, and commission split for a customer and service provider transaction.' : isAdmin ? adminOtpStep ? 'Enter the one-time password sent to your registered mobile number.' : 'Sign in with your email, password, and CAPTCHA to continue.' : isFeedback ? 'Share a quick rating and note about your experience.' : isContact ? 'Send us a note and our team will respond shortly.' : isLabour ? 'Share a few details and start finding work near you.' : 'We’ll help you connect with a trusted professional nearby.'}</p><form onSubmit={(event) => { event.preventDefault(); if (isAdmin && !adminOtpStep) { if (captchaAnswer.trim().toUpperCase() !== captchaCode) { setCaptchaError('CAPTCHA does not match.'); return } setAdminOtpStep(true); return } if (isAdmin && !/^\d{6}$/.test(adminOtp)) { setOtpError('Enter the 6-digit OTP sent to your mobile.'); return } if (!isLabour && !isContact && !isFeedback && !isPayment) onSignedIn(); if (isAdmin) onAdminSuccess(); setSubmitted(true) }}>
        {isPayment ? <>
          <label>Payment scenario<select required value={paymentScenario} onChange={(event) => {
            const nextScenario = event.target.value
            setPaymentScenario(nextScenario)
            const nextMethods = paymentScenarios.find((scenario) => scenario.id === nextScenario)?.methods || []
            setPaymentMethod(nextMethods[0] || '')
          }}><option value="" disabled>Select a scenario</option>{paymentScenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.label}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
          <label>Payment method<select required value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="" disabled>Select a method</option>{activeScenarioMethods.map((method) => <option key={method} value={method}>{method}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
          <label>Customer name<input required type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="e.g. Arjun Reddy" /></label>
          <label>Service provider name<input required type="text" value={providerName} onChange={(event) => setProviderName(event.target.value)} placeholder="e.g. Suresh Kumar" /></label>
          <label>Service amount<input required type="number" min="0" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="2500" /></label>
          {(paymentScenario === 'customer-to-app' || paymentScenario === 'provider-to-app') && <label>App commission (%)<input required type="number" value={commissionRate} readOnly /></label>}
          <div className="payment-breakdown">
            <div><span>{customerPaysLabel}</span><strong>₹{customerPays.toLocaleString('en-IN')}</strong></div>
            <div><span>Service Provider receives</span><strong>₹{providerReceives.toLocaleString('en-IN')}</strong></div>
            <div><span>Platform fee</span><strong>₹{appCollects.toLocaleString('en-IN')}</strong></div>
            <div><span>{settlementLabel}</span><strong>₹{settlementAmount.toLocaleString('en-IN')}</strong></div>
          </div>
        </> : isAdmin && !adminOtpStep ? <>
          <label>Admin email<input required type="email" placeholder="admin@worknear.in" /></label>
          <label>Password<input required type="password" placeholder="Enter password" /></label>
          <div className="captcha-field"><span>CAPTCHA</span><div className="captcha-code-row"><strong>{captchaCode}</strong><button className="captcha-refresh" type="button" onClick={refreshCaptcha} aria-label="Refresh CAPTCHA" title="Refresh CAPTCHA"><RefreshCw size={15} /></button></div><input required type="text" value={captchaAnswer} onChange={(event) => { setCaptchaAnswer(event.target.value); setCaptchaError('') }} placeholder="Enter CAPTCHA" aria-label="Enter CAPTCHA" />{captchaError && <small>{captchaError}</small>}</div>
        </> : isAdmin ? <>
          <div className="otp-notice">OTP sent to your registered mobile number.</div>
          <label>One-time password<input required type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={adminOtp} onChange={(event) => { setAdminOtp(event.target.value.replace(/\D/g, '')); setOtpError('') }} placeholder="Enter 6-digit OTP" />{otpError && <small className="otp-error">{otpError}</small>}</label>
        </> : null}
        {isLabour ? <>
          <label>What service do you offer<select required value={selectedService} onChange={(event) => setSelectedService(event.target.value)}><option value="" disabled>Select your service</option>{labourTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
          {selectedService === 'Electricians' && <label>Electrician specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>Home Specialist</option><option>Farming Motors Specialist</option><option>Both Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Vehicle & Machinery Repairs' && <label>Vehicle & Machinery specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>Bike Specialist</option><option>Tractor Specialist</option><option>JCB Specialist</option><option>All Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Farming & Daily Wage Service Providers' && <label>Farming specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>All Farming Works Specialist</option><option>Loaders Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Construction Service Providers' && <label>Construction specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option>{constructionSpecialists.map((item) => <option key={item.name} value={item.value || item.name} disabled={item.divider}>{item.divider ? item.name : `${item.name} → ${item.description}`}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Marriage & Other Functions Service Providers' && <label>Marriage/function specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option>{marriageFunctionSpecialists.map((item) => <option key={item.name} value={item.value || item.name} disabled={item.divider}>{item.divider ? item.name : `${item.name} → ${item.description}`}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
        </> : isContact ? <><label>Customer care numbers<div className="customer-care-list"><a href="tel:+919876543210">+91 98765 43210</a><a href="tel:+919123456789">+91 91234 56789</a></div></label><label>Your message<textarea required placeholder="Tell us how we can help" /></label></> : isFeedback ? <><label>How would you rate your experience?<select required defaultValue=""><option value="" disabled>Select a rating</option><option>Excellent</option><option>Good</option><option>Needs improvement</option></select><ChevronDown className="select-icon" size={16} /></label><label>Your feedback<textarea required placeholder="Share your thoughts" /></label></> : !isAdmin && !isPayment && <label className="voice-field">What do you need help with?<div className="voice-input-row"><input required type="text" value={customerNeed} onChange={(event) => { setCustomerNeed(event.target.value); setVoiceError('') }} placeholder="e.g. Fix a leaking tap" /><button className={isListening ? 'voice-button listening' : 'voice-button'} type="button" onClick={startVoiceInput} aria-label="Use voice command" title="Use voice command">{isListening ? <MicOff size={16} /> : <Mic size={16} />}</button></div>{voiceError && <small>{voiceError}</small>}</label>}
        {!isFeedback && !isAdmin && !isPayment && !isCustomer && null}
        <button className="primary-button form-submit" type="submit">{isPayment ? 'Process payment' : isAdmin ? adminOtpStep ? 'Verify OTP' : 'Continue to OTP' : isFeedback ? 'Send feedback' : isContact ? 'Send message' : isLabour ? 'Create my profile' : 'Find a professional'} <ArrowRight size={18} /></button>
        {isAdmin && <button className="signin-back" type="button" onClick={handleAdminBack}>&lt;- Back</button>}
      </form></>}
    </section>
  </div>
}


function AdminDashboard({ initialView = 'providers', onViewChange, onSignOut }) {
  const [adminView, setAdminView] = useState(initialView)
  const [providers, setProviders] = useState([
    { id: 1, name: 'Suresh Kumar', mobile: '90000 12345', address: 'Atmakur, Nellore', service: 'Electricians', customer: 'Lakshmi Reddy', customerMobile: '91234 56789', customerAddress: 'Atmakur, Nellore', serviceStatus: 'In-Progress', paymentStatus: 'Resolved - Payment pending with customer', amount: 2500, status: 'Active', blocked: false, comment: 'Active for new electrical work.', accessAdmin: null },
    { id: 2, name: 'Ravi Naidu', mobile: '90000 67890', address: 'Marripadu, Nellore', service: 'Plumbers', customer: 'Arjun Reddy', customerMobile: '92345 67890', customerAddress: 'Marripadu, Nellore', serviceStatus: 'Completed', paymentStatus: 'Resolved - Payment done by customer', amount: 1800, status: 'Active', blocked: false, comment: 'Verified provider.', accessAdmin: null },
    { id: 5, name: 'Kiran Babu', mobile: '90555 11223', address: 'Vinjamur, Nellore', service: 'Construction Service Providers', customer: 'Meena Devi', customerMobile: '93456 78901', customerAddress: 'Vinjamur, Nellore', serviceStatus: 'Completed', paymentStatus: 'Resolved - Payment done by customer', amount: 2250, status: 'Active', blocked: true, comment: 'Temporarily unActive.', accessAdmin: { name: 'WorkNear Admin', mobile: '98765 43210' } },
  ])
  const [pendingProviders, setPendingProviders] = useState([
    { id: 3, name: 'Mohan Rao', mobile: '90123 45678', address: 'Vinjamur, Nellore', service: 'Electricians', workPhoto: '/src/Workers.png', status: 'Inactive', approved: false, approval: null },
    { id: 4, name: 'Anitha Devi', mobile: '90876 54321', address: 'Atmakur, Nellore', service: 'Painters', workPhoto: '/src/Service_Provider_Img.png', status: 'Inactive', approved: false, approval: null },
  ])
  const [editingId, setEditingId] = useState(null)
  const [editingAccessId, setEditingAccessId] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [adminDetails] = useState({ name: 'WorkNear Admin', mobile: '98765 43210', email: 'admin@worknear.in' })

  useEffect(() => {
    setAdminView(initialView)
  }, [initialView])

  const changeAdminView = (view) => {
    setAdminView(view)
    onViewChange?.(view)
  }

  const updateProvider = (id, field, value) => {
    setPendingProviders((current) => current.map((provider) => provider.id === id ? { ...provider, [field]: value } : provider))
  }

  const approveProvider = (provider) => {
    const approval = { admin: adminDetails.name, mobile: adminDetails.mobile, email: adminDetails.email, date: new Date().toLocaleString('en-IN') }
    setPendingProviders((current) => current.filter((item) => item.id !== provider.id))
    setProviders((current) => [...current, { ...provider, status: 'Active', approved: true, approval, customer: 'Pending', customerMobile: 'Pending', customerAddress: 'Pending', serviceStatus: 'Not Started', paymentStatus: 'Resolved - Payment pending with customer', amount: 0, blocked: false, comment: 'Approved provider.', accessAdmin: null }])
  }

  const updateAccessProvider = (id, field, value) => {
    setProviders((current) => current.map((provider) => provider.id === id ? { ...provider, [field]: value } : provider))
  }

  const toggleProviderAccess = (provider) => {
    updateAccessProvider(provider.id, 'blocked', !provider.blocked)
    updateAccessProvider(provider.id, 'accessAdmin', { name: adminDetails.name, mobile: adminDetails.mobile })
  }

  const requestConfirmation = (action, provider, onConfirm) => setConfirmation({ action, provider, onConfirm })

  return <div className="admin-dashboard-content">
    <div className="admin-dashboard-header"><div><h3>{adminView === 'payments' ? 'Payment Status' : adminView === 'service-providers' ? 'Service Providers' : 'Service Providers Management'}</h3></div><div className="admin-dashboard-actions">{adminView !== 'providers' && <button className="admin-dashboard-link" type="button" onClick={() => changeAdminView('providers')}><ArrowLeft size={14} /> Back</button>}<button className="admin-dashboard-link" type="button" onClick={() => changeAdminView('payments')}>Payment Status</button><button className="admin-dashboard-link" type="button" onClick={() => changeAdminView('service-providers')}>Service Providers</button><button className="admin-signout" onClick={onSignOut}><LogOut size={15} /> Sign out</button></div></div>
    {adminView === 'payments' ? <AdminPaymentStatus providers={providers} /> : adminView === 'service-providers' ? <AdminServiceProviders providers={providers} /> : <>
    <div className="admin-dashboard-grid">
      <div className="admin-stat"><strong>3</strong><span>Active Service Providers</span></div>
      <div className="admin-stat"><strong>1</strong><span>Inactive Service Provider</span></div>
      <div className="admin-stat"><strong>2</strong><span>Blocked Service Providers</span></div>
    </div>
    <AdminTableSection title="Active Service Providers" description="Monitor approved service providers profiles.">
      <div className="admin-table-wrap"><table className="admin-table" id="service-providers"><thead><tr><th>Service Provider Name</th><th>Mobile Number</th><th>Address</th><th>Services Knows</th><th>Profile Status</th><th>Approved Admin Name</th><th>Admin Mobile Number</th></tr></thead><tbody>{providers.map((provider) => <tr key={provider.id}><td><strong>{provider.name}</strong></td><td>{provider.mobile}</td><td>{provider.address}</td><td>{provider.service || 'Service Provider'}</td><td><span className="table-status complete">{provider.status}</span></td><td>{provider.approval?.admin || provider.accessAdmin?.name || 'WorkNear Admin'}</td><td>{provider.approval?.mobile || provider.accessAdmin?.mobile || '98765 43210'}</td></tr>)}</tbody></table></div>
    </AdminTableSection>
    <AdminTableSection title="Service Providers Access" description="Block or unblock service providers and record Admin comments.">
      <div className="admin-table-wrap"><table className="admin-table access-table"><thead><tr><th>Service Provider Name</th><th>Mobile Number</th><th>Address</th><th>Services Knows</th><th>Profile Status</th><th>Block / Unblock</th><th>Comment</th><th>Edit</th><th>Admin Name</th><th>Admin Mobile Number</th></tr></thead><tbody>{providers.map((provider) => <tr key={provider.id}><td><strong>{provider.name}</strong></td><td>{provider.mobile}</td><td>{provider.address}</td><td>{provider.service || 'Service Provider'}</td><td><span className={provider.blocked ? 'table-status blocked' : 'table-status complete'}>{provider.blocked ? 'Blocked' : provider.status}</span></td><td><button className={provider.blocked ? 'table-action approve' : 'table-action block'} onClick={() => requestConfirmation(provider.blocked ? 'Unblock' : 'Block', provider, () => toggleProviderAccess(provider))}>{provider.blocked ? 'Unblock' : 'Block'}</button></td><td>{editingAccessId === provider.id ? <input value={provider.comment} onChange={(event) => updateAccessProvider(provider.id, 'comment', event.target.value)} aria-label={`Comment for ${provider.name}`} /> : provider.comment}</td><td>{editingAccessId === provider.id ? <button className="table-action" onClick={() => setEditingAccessId(null)}>Save</button> : <button className="table-icon-action" onClick={() => setEditingAccessId(provider.id)} title="Edit provider comment" aria-label={`Edit ${provider.name}`}><Pencil size={14} /></button>}</td><td>{provider.accessAdmin?.name || 'Pending'}</td><td>{provider.accessAdmin?.mobile || 'Pending'}</td></tr>)}</tbody></table></div>
    </AdminTableSection>
    <AdminTableSection eyebrow="Admin Review Required" title="Newly Registered Service Providers" description="Review service providers details and approve new profiles.">
      <div className="admin-table-wrap"><table className="admin-table approval-table"><thead><tr><th>Service Provider Name</th><th>Mobile Number</th><th>Address</th><th>Services Knows</th><th>Work Images</th><th>Profile Status</th><th>Admin Action</th><th>Admin Name</th><th>Admin Mobile Number</th></tr></thead><tbody>{pendingProviders.map((provider) => <tr key={provider.id}><td>{editingId === provider.id ? <input value={provider.name} onChange={(event) => updateProvider(provider.id, 'name', event.target.value)} /> : <strong>{provider.name}</strong>}</td><td>{editingId === provider.id ? <input value={provider.mobile} onChange={(event) => updateProvider(provider.id, 'mobile', event.target.value)} /> : provider.mobile}</td><td>{editingId === provider.id ? <input value={provider.address} onChange={(event) => updateProvider(provider.id, 'address', event.target.value)} /> : provider.address}</td><td>{editingId === provider.id ? <select value={provider.service} onChange={(event) => updateProvider(provider.id, 'service', event.target.value)}>{labourTypes.map((service) => <option key={service}>{service}</option>)}</select> : provider.service}</td><td><img className="work-photo" src={provider.workPhoto} alt={`${provider.name} completed work`} /></td><td><span className="table-status progress">{provider.status}</span></td><td><div className="approval-actions">{editingId === provider.id ? <button className="table-action" onClick={() => setEditingId(null)}>Save</button> : <button className="table-icon-action" onClick={() => setEditingId(provider.id)} title="Edit provider" aria-label={`Edit ${provider.name}`}><Pencil size={14} /></button>}<button className="table-action approve" onClick={() => requestConfirmation('Approve', provider, () => approveProvider(provider))}>Approve</button></div></td><td>{provider.approval?.admin || 'Pending'}</td><td>{provider.approval?.mobile || 'Pending'}</td></tr>)}</tbody></table></div>
    </AdminTableSection>
    </>}
    {confirmation && <div className="admin-confirm-backdrop" role="presentation"><section className="admin-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><p className="eyebrow">Confirm action</p><h3 id="confirm-title">{confirmation.action} provider?</h3><p>{confirmation.action} {confirmation.provider.name} will update their provider access status.</p><div className="admin-confirm-actions"><button className="table-action" onClick={() => setConfirmation(null)}>Cancel</button><button className="table-action approve" onClick={() => { confirmation.onConfirm(); setConfirmation(null) }}>Confirm</button></div></section></div>}
  </div>
}

function AdminServiceProviders({ providers }) {
  return <section className="admin-service-providers-page" aria-label="Service providers">
    <AdminTableSection description="Service providers profiles and their uploaded scan codes.">
      <div className="admin-table-wrap"><table className="admin-table service-provider-list-table"><thead><tr><th>Service Provider Name</th><th>Mobile Number</th><th>Address</th><th>Service Provider Uploaded (Scan Code)</th></tr></thead><tbody>{providers.map((provider) => <tr key={provider.id}><td><strong>{provider.name}</strong></td><td>{provider.mobile}</td><td>{provider.address}</td><td><ScanCodeStatus uploaded={provider.scanCodeUploaded !== false} /></td></tr>)}</tbody></table></div>
    </AdminTableSection>
    <AdminTableSection title="Platform" description="Platform account and uploaded scan code.">
      <div className="admin-table-wrap"><table className="admin-table platform-list-table"><thead><tr><th>Platform Name</th><th>Platform Uploaded (Scan Code)</th></tr></thead><tbody><tr><td><strong>WorkNear</strong></td><td><ScanCodeStatus uploaded /></td></tr></tbody></table></div>
    </AdminTableSection>
  </section>
}

function ScanCodeStatus({ uploaded }) {
  return <span className={uploaded ? 'scan-code-status uploaded' : 'scan-code-status'}><QrCode size={17} />{uploaded ? 'Uploaded' : 'Not uploaded'}</span>
}

function AdminPaymentStatus({ providers }) {
  return <section className="admin-payment-page" aria-label="Payment status"><p className="admin-payment-intro">Track resolved customer payments and pending customer payments.</p><div className="admin-table-wrap"><table className="admin-table payment-status-table"><thead><tr><th>Service Provider Name</th><th>Mobile Number</th><th>Service Address</th><th>Customer Name</th><th>Customer Mobile Number</th><th>Customer Address</th><th>Payment Status</th><th>Customer Pays</th><th>Service Provider Receives</th><th>Platform Fee</th></tr></thead><tbody>{providers.map((provider) => { const isPendingWithCustomer = provider.paymentStatus.toLowerCase().includes('pending with customer'); const customerPays = isPendingWithCustomer ? 0 : provider.amount; const platformFee = isPendingWithCustomer ? 0 : provider.amount * 0.1; const providerReceives = isPendingWithCustomer ? 0 : provider.amount - platformFee; return <tr key={provider.id}><td><strong>{provider.name}</strong></td><td>{provider.mobile}</td><td>{provider.address}</td><td>{provider.customer}</td><td>{provider.customerMobile}</td><td>{provider.customerAddress}</td><td><span className={provider.paymentStatus.includes('done') ? 'table-status complete' : 'table-status progress'}>{provider.paymentStatus}</span></td><td>₹{customerPays.toLocaleString('en-IN')}</td><td>₹{providerReceives.toLocaleString('en-IN')}</td><td>₹{platformFee.toLocaleString('en-IN')}</td></tr> })}</tbody></table></div></section>
}

function AdminTableSection({ eyebrow, title, description, children }) {
  return <section className="admin-table-section"><div className="admin-section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}{title && <h3>{title}</h3>}<p>{description}</p></div></div>{children}</section>
}
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
