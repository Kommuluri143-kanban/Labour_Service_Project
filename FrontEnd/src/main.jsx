import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, Check, ChevronDown, Menu, Search, ShieldCheck, UserRound, X } from 'lucide-react'
import './styles.css'

const categories = [
  { name: 'Electricians', icon: '⚡', count: '18 nearby teams' },
  { name: 'Vehicle & Machinery Repairs', icon: '🔧', count: '11 nearby teams' },
  { name: 'Farming & Daily Wage Service Providers', icon: '🌾', count: '22 nearby teams' },
  { name: 'Painters', icon: '🎨', count: '9 nearby teams' },
  { name: 'Plumbers', icon: '🚰', count: '14 nearby teams' },
  { name: 'Carpenters', icon: '🪚', count: '7 nearby teams' },
  { name: 'Construction Service Providers', icon: '🏗️', count: '5 nearby teams' },
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
  'Other Service Providers',
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

function App() {
  const [activeForm, setActiveForm] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [providerAvailability, setProviderAvailability] = useState('Available')

  const openForm = (form) => {
    setSubmitted(false)
    setActiveForm(form)
    setMenuOpen(false)
    setProfileOpen(false)
  }

  const closeForm = () => setActiveForm(null)

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
          <button className="text-button" onClick={() => openForm('customer')}>Sign in</button>
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
          {profileOpen && <ProfilePanel availability={providerAvailability} onAvailabilityChange={setProviderAvailability} onSignOut={() => { setSignedIn(false); setProfileOpen(false) }} onClose={() => setProfileOpen(false)} />}
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

      {activeForm && <RegistrationModal type={activeForm} submitted={submitted} setSubmitted={setSubmitted} providerAvailability={providerAvailability} onSignedIn={() => setSignedIn(true)} onClose={closeForm} />}
    </main>
  )
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
      <div><strong>{name || 'Your name'}</strong><span>{role}</span><small>{mobile || 'Mobile number'}</small></div>
    </div>
    <div className="profile-fields">
      <label>Profile type<select value={role} onChange={handleRoleChange}><option>Customer</option><option>Service Provider</option></select><ChevronDown className="select-icon" size={16} /></label>
      <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" /></label>
      <label>Mobile number<input value={mobile} onChange={(event) => setMobile(event.target.value)} type="tel" placeholder="Enter mobile number" /></label>
      <label className="image-upload">Profile image<input type="file" accept="image/*" onChange={handleImageChange} /></label>
      {role === 'Service Provider' && <><label>Request status<select value={draftAvailability} onChange={(event) => setDraftAvailability(event.target.value)}><option>Available</option><option>Not Available</option></select><ChevronDown className="select-icon" size={16} /></label><button className="profile-update" type="button" onClick={() => onAvailabilityChange(draftAvailability)}>Update</button></>}
    </div>
    <div className={role === 'Service Provider' && availability === 'Available' ? 'availability-note active' : 'availability-note'}><span className="status-dot" />{role === 'Service Provider' ? availability === 'Available' ? 'Accepting new service requests' : 'Not accepting service requests' : 'Customer profile ready'}</div>
  </section>
}

function RegistrationModal({ type, submitted, setSubmitted, providerAvailability, onSignedIn, onClose }) {
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
  const [selectedProvider, setSelectedProvider] = useState('')
  const [amount, setAmount] = useState('2500')
  const [commissionRate, setCommissionRate] = useState('10')
  const [paymentScenario, setPaymentScenario] = useState('customer-to-app')
  const [paymentMethod, setPaymentMethod] = useState('QR scan')

  const numericAmount = Number(amount || 0)
  const numericRate = Number(commissionRate || 0)
  const appCommission = numericAmount * numericRate / 100
  const providerPayout = numericAmount - appCommission
  const activeScenarioMethods = paymentScenarios.find((scenario) => scenario.id === paymentScenario)?.methods || []
  const hasAvailableProvider = providerAvailability === 'Available'

  const customerPays = paymentScenario === 'customer-to-app' || paymentScenario === 'provider-to-app' ? numericAmount : 0
  const appCollects = paymentScenario === 'customer-to-app' ? appCommission : paymentScenario === 'provider-to-app' ? appCommission : 0
  const providerReceives = paymentScenario === 'customer-to-app' || paymentScenario === 'provider-to-app' ? providerPayout : 0
  const customerPaysLabel = paymentScenario === 'customer-to-app' ? 'Customer pays → Platform' : 'Customer pays → Service Provider'
  const settlementLabel = paymentScenario === 'customer-to-app' ? 'Platform pays → Service Provider' : 'Service Provider pays → Platform'
  const settlementAmount = paymentScenario === 'customer-to-app' ? providerPayout : appCommission

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="close-button" onClick={onClose} aria-label="Close registration form"><X size={20} /></button>
      {submitted ? <div className="success-state admin-dashboard">
        <span className="success-icon"><Check size={26} /></span>
        <p className="eyebrow">{isPayment ? 'Payment complete' : isAdmin ? 'Admin dashboard' : isFeedback ? 'Feedback received' : isContact ? 'Message received' : 'You’re on the list'}</p>
        <h2>{isPayment ? 'Payment exchange success' : isAdmin ? 'Welcome back, Admin.' : isFeedback ? 'Thanks for your feedback.' : isContact ? 'Thanks for contacting us.' : 'Thanks for reaching out.'}</h2>
        {isPayment ? <div className="payment-summary">
          <div><span>Flow</span><strong>{paymentScenarios.find((scenario) => scenario.id === paymentScenario)?.label}</strong></div>
          <div><span>Method</span><strong>{paymentMethod}</strong></div>
          <div><span>{customerPaysLabel}</span><strong>₹{customerPays.toLocaleString('en-IN')}</strong></div>
          <div><span>Provider receives</span><strong>₹{providerReceives.toLocaleString('en-IN')}</strong></div>
          <div><span>Platform fee</span><strong>₹{appCollects.toLocaleString('en-IN')}</strong></div>  
          <div><span>{settlementLabel}</span><strong>₹{settlementAmount.toLocaleString('en-IN')}</strong></div>
        </div> : isAdmin ? <div className="admin-dashboard-grid">
          <div className="admin-stat"><strong>128</strong><span>Profiles</span></div>
          <div className="admin-stat"><strong>24</strong><span>New leads</span></div>
          <div className="admin-stat"><strong>9</strong><span>Pending</span></div>
        </div> : <p>{isFeedback ? 'Your thoughts help us improve the local work board.' : isContact ? 'We’ve received your message and will get back to you shortly.' : 'We’ve received your details and will be in touch shortly.'}</p>}
        <button className="primary-button" onClick={onClose}>Back to home <ArrowRight size={18} /></button>
      </div> : <><p className="eyebrow">{isPayment ? 'Secure transfer' : isAdmin ? 'Secure access' : isFeedback ? 'Help us improve' : isContact ? 'Get in touch' : isLabour ? 'Join the network' : 'Find the right help'}</p><h2 id="modal-title">{isPayment ? 'Payment Exchange' : isAdmin ? 'Admin login' : isFeedback ? 'Tell us what you think' : isContact ? 'How can we help?' : isLabour ? 'Register as a service provider' : 'Tell us what you need'}</h2><p className="modal-intro">{isPayment ? 'Choose the payment flow, method, and commission split for a customer and service provider transaction.' : isAdmin ? 'Sign in to review registrations, service requests, and community activity.' : isFeedback ? 'Share a quick rating and note about your experience.' : isContact ? 'Send us a note and our team will respond shortly.' : isLabour ? 'Share a few details and start finding work near you.' : 'We’ll help you connect with a trusted professional nearby.'}</p><form onSubmit={(event) => { event.preventDefault(); if (isCustomer && (!hasAvailableProvider || !selectedProvider)) return; if (!isLabour && !isContact && !isFeedback && !isAdmin && !isPayment) onSignedIn(); setSubmitted(true) }}>
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
        </> : isAdmin ? <>
          <label>Admin email<input required type="email" placeholder="admin@worknear.in" /></label>
          <label>Password<input required type="password" placeholder="Enter password" /></label>
        </> : <>
          <label>Full name<input required type="text" placeholder="e.g. chaaku John" /></label>
          <label>Phone number<input required type="tel" placeholder="e.g. 90000 12345" /></label>
        </>}
        {isCustomer && <>
          <label>Available service provider<select required value={selectedProvider} onChange={(event) => setSelectedProvider(event.target.value)} disabled={!hasAvailableProvider}><option value="" disabled>{hasAvailableProvider ? 'Select a service provider' : 'No service providers available'}</option>{hasAvailableProvider && <option value="Suresh Kumar">Suresh Kumar · Available</option>}</select><ChevronDown className="select-icon" size={16} /></label>
          {!hasAvailableProvider && <p className="request-status-warning">No available service providers can receive requests right now.</p>}
        </>}
        {isLabour ? <>
          <label>What service do you offer<select required value={selectedService} onChange={(event) => setSelectedService(event.target.value)}><option value="" disabled>Select your service</option>{labourTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
          {selectedService === 'Electricians' && <label>Electrician specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>Home Specialist</option><option>Farming Motors Specialist</option><option>Both Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Vehicle & Machinery Repairs' && <label>Vehicle & Machinery specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>Bike Specialist</option><option>Tractor Specialist</option><option>JCB Specialist</option><option>All Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Farming & Daily Wage Service Providers' && <label>Farming specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>All Farming Works Specialist</option><option>Loaders Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Construction Service Providers' && <label>Construction specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>Masons Specialist</option><option>Labours Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
        </> : isContact ? <label>Your message<textarea required placeholder="Tell us how we can help" /></label> : isFeedback ? <><label>How would you rate your experience?<select required defaultValue=""><option value="" disabled>Select a rating</option><option>Excellent</option><option>Good</option><option>Needs improvement</option></select><ChevronDown className="select-icon" size={16} /></label><label>Your feedback<textarea required placeholder="Share your thoughts" /></label></> : !isAdmin && !isPayment && <label>What do you need help with?<input required type="text" placeholder="e.g. Fix a leaking tap" /></label>}
        {!isFeedback && !isAdmin && !isPayment && <><label>Mandal<select required value={selectedMandal} onChange={(event) => setSelectedMandal(event.target.value)}><option value="" disabled>Select your mandal</option>{mandals.map((mandal) => <option key={mandal}>{mandal}</option>)}</select><ChevronDown className="select-icon" size={16} /></label><label>Village<select key={selectedMandal} required defaultValue="" disabled={!selectedMandal}><option value="" disabled>Select your village</option>{(mandalVillages[selectedMandal] || []).map((village) => <option key={village}>{village}</option>)}</select><ChevronDown className="select-icon" size={16} /></label></>}
        <button className="primary-button form-submit" type="submit" disabled={isCustomer && (!hasAvailableProvider || !selectedProvider)}>{isPayment ? 'Process payment' : isAdmin ? 'Open dashboard' : isFeedback ? 'Send feedback' : isContact ? 'Send message' : isLabour ? 'Create my profile' : 'Find a professional'} <ArrowRight size={18} /></button>
      </form></>}
    </section>
  </div>
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
