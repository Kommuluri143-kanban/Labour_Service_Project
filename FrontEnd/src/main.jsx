import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, Check, ChevronDown, Menu, Search, ShieldCheck, X } from 'lucide-react'
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
}
const mandals = Object.keys(mandalVillages)

function App() {
  const [activeForm, setActiveForm] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  const openForm = (form) => {
    setSubmitted(false)
    setActiveForm(form)
    setMenuOpen(false)
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
          <button className="text-button" onClick={() => setSignedIn(false)}>Sign out</button>
        </nav>
      </header>

      <div className="page-layout">
        <section className="category-section" id="categories">
          <div className="service-area"><p className="eyebrow">Service area</p><h2>2 mandals covered</h2><p>SPSR Nellore District, Andhra Pradesh</p>{mandals.map((mandal) => <strong key={mandal}>{mandal} · {mandalVillages[mandal].length} villages</strong>)}</div>
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
              <div className="trust-row">
                <div className="avatar-stack" aria-hidden="true"><span>R</span><span>S</span><span>M</span><span>+</span></div>
                <span><strong>64</strong> neighbourhood crews listed</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="image-frame">
                <img src="/src/Workers.png" alt="Local workers preparing tools for a repair" />
                <div className="image-caption"><span className="status-dot" /> Profiles checked by the community <ShieldCheck size={16} /></div>
              </div>
              <div className="floating-note note-top"><span className="note-icon yellow"><Check size={15} /></span><span><strong>Clear profiles</strong><small>Skills and area shown</small></span></div>
              <div className="floating-note note-bottom"><span className="note-icon green"><Search size={15} /></span><span><strong>Have a small job?</strong><small>Post it in a minute</small></span></div>
            </div>
          </section>

          <footer><span>© 2026 WorkNear</span><span>A small board for useful work</span></footer>
        </div>
      </div>

      {activeForm && <RegistrationModal type={activeForm} submitted={submitted} setSubmitted={setSubmitted} onSignedIn={() => setSignedIn(true)} onClose={closeForm} />}
    </main>
  )
}

function RegistrationModal({ type, submitted, setSubmitted, onSignedIn, onClose }) {
  const isLabour = type === 'labour'
  const isContact = type === 'contact'
  const isFeedback = type === 'feedback'
  const [selectedMandal, setSelectedMandal] = useState('')
  const [selectedService, setSelectedService] = useState('')
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="close-button" onClick={onClose} aria-label="Close registration form"><X size={20} /></button>
      {submitted ? <div className="success-state"><span className="success-icon"><Check size={26} /></span><p className="eyebrow">{isFeedback ? 'Feedback received' : isContact ? 'Message received' : 'You’re on the list'}</p><h2>{isFeedback ? 'Thanks for your feedback.' : isContact ? 'Thanks for contacting us.' : 'Thanks for reaching out.'}</h2><p>{isFeedback ? 'Your thoughts help us improve the local work board.' : isContact ? 'We’ve received your message and will get back to you shortly.' : 'We’ve received your details and will be in touch shortly.'}</p><button className="primary-button" onClick={onClose}>Back to home <ArrowRight size={18} /></button></div> : <><p className="eyebrow">{isFeedback ? 'Help us improve' : isContact ? 'Get in touch' : isLabour ? 'Join the network' : 'Find the right help'}</p><h2 id="modal-title">{isFeedback ? 'Tell us what you think' : isContact ? 'How can we help?' : isLabour ? 'Register as a service provider' : 'Tell us what you need'}</h2><p className="modal-intro">{isFeedback ? 'Share a quick rating and note about your experience.' : isContact ? 'Send us a note and our team will respond shortly.' : isLabour ? 'Share a few details and start finding work near you.' : 'We’ll help you connect with a trusted professional nearby.'}</p><form onSubmit={(event) => { event.preventDefault(); if (!isLabour && !isContact && !isFeedback) onSignedIn(); setSubmitted(true) }}>
        <label>Full name<input required type="text" placeholder="e.g. chaaku John" /></label>
        <label>Phone number<input required type="tel" placeholder="e.g. 90000 12345" /></label>
        {isLabour ? <>
          <label>What service do you offer<select required value={selectedService} onChange={(event) => setSelectedService(event.target.value)}><option value="" disabled>Select your service</option>{labourTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
          {selectedService === 'Electricians' && <label>Electrician specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>Home Specialist</option><option>Farming Motors Specialist</option><option>Both Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Vehicle & Machinery Repairs' && <label>Vehicle & Machinery specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>Bike Specialist</option><option>Tractor Specialist</option><option>JCB Specialist</option><option>All Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Farming & Daily Wage Service Providers' && <label>Farming specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>All Farming Works Specialist</option><option>Loaders Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Construction Service Providers' && <label>Construction specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>Masons Specialist</option><option>Labours Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
        </> : isContact ? <label>Your message<textarea required placeholder="Tell us how we can help" /></label> : isFeedback ? <><label>How would you rate your experience?<select required defaultValue=""><option value="" disabled>Select a rating</option><option>Excellent</option><option>Good</option><option>Needs improvement</option></select><ChevronDown className="select-icon" size={16} /></label><label>Your feedback<textarea required placeholder="Share your thoughts" /></label></> : <label>What do you need help with?<input required type="text" placeholder="e.g. Fix a leaking tap" /></label>}
        {!isFeedback && <><label>Mandal<select required value={selectedMandal} onChange={(event) => setSelectedMandal(event.target.value)}><option value="" disabled>Select your mandal</option>{mandals.map((mandal) => <option key={mandal}>{mandal}</option>)}</select><ChevronDown className="select-icon" size={16} /></label><label>Village<select key={selectedMandal} required defaultValue="" disabled={!selectedMandal}><option value="" disabled>Select your village</option>{(mandalVillages[selectedMandal] || []).map((village) => <option key={village}>{village}</option>)}</select><ChevronDown className="select-icon" size={16} /></label></>}
        <button className="primary-button form-submit" type="submit">{isFeedback ? 'Send feedback' : isContact ? 'Send message' : isLabour ? 'Create my profile' : 'Find a professional'} <ArrowRight size={18} /></button>
      </form></>}
    </section>
  </div>
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
