import { ArrowRight, ChevronDown, Menu, UserRound, X } from 'lucide-react'
import { categories } from '../../data/serviceData.js'
import { HomeDirectory } from '../HomeDirectory/HomeDirectory.jsx'
import { ProfilePanel } from '../../components/AppComponents.jsx'
import './AppHomePage.css'

export function AppHomePage({
  menuOpen, setMenuOpen, profileOpen, setProfileOpen, signedIn, profileAccountType, userProfile,
  providerAvailability, setProviderAvailability, acceptedServiceProvider, setAcceptedServiceProvider,
  setUserProfile, canOpenProviderRegistration, canViewServiceHistory, canViewEmployerDirectories,
  canAccessCustomerServices, canAccessPaymentExchange, canAccessContactFeedback, canAccessWNPocket,
  canCloseAccount, showProfilePanel, openForm, onOpenServiceHistory, onOpenWNPocket,
  onOpenCloseAccount, onOpenResign, onOpenAcceptedServices, onAcceptServiceRequest, onSignOut, approvedRequests,
}) {
  const canAccessAdmin = !signedIn || profileAccountType === 'Admin'
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
          <a href="#categories" onClick={() => setMenuOpen(false)}>Find services</a>
          <button className="nav-cta" onClick={() => openForm('labour')} disabled={!canOpenProviderRegistration} aria-disabled={!canOpenProviderRegistration} title={!canOpenProviderRegistration ? 'Service provider registration is unavailable for this profile.' : undefined}>Join as a service provider</button>
          {canViewServiceHistory && <button className="nav-cta" onClick={onOpenServiceHistory}>Service history</button>}
          {canViewEmployerDirectories && <>
            <a className="nav-section-link" href="#approved-customer-requests" onClick={() => setMenuOpen(false)}>Approved Customer Requests</a>
          </>}
          {canAccessAdmin && <button className="text-button" onClick={() => openForm('admin')}>Admin</button>}
          <button className="nav-cta contact-cta" onClick={() => openForm('contact')} disabled={!canAccessContactFeedback} aria-disabled={!canAccessContactFeedback} title={!canAccessContactFeedback ? 'Contact Us is unavailable for Admin profiles.' : undefined}>Contact us</button>
          <button className="nav-cta feedback-cta" onClick={() => openForm('feedback')} disabled={!canAccessContactFeedback} aria-disabled={!canAccessContactFeedback} title={!canAccessContactFeedback ? 'Feedback is unavailable for Admin profiles.' : undefined}>Feedback</button>
          {canAccessWNPocket && <button className="nav-cta wnpocket-nav-link" type="button" onClick={onOpenWNPocket}>WNPocket</button>}
          {canCloseAccount && <button className="nav-cta nav-close-account" type="button" onClick={onOpenCloseAccount}>Close Account</button>}
        </nav>
        <div className="profile-area">
          {signedIn && profileAccountType === 'Employer' && <button className="profile-resign" type="button" onClick={onOpenResign}>Resign</button>}
          <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen} aria-controls="profile-panel">
            <span className="profile-trigger-avatar"><UserRound size={17} /></span>
            <span className="profile-trigger-copy"><strong>{signedIn ? 'My profile' : 'Profile'}</strong><small>{signedIn ? 'Signed in' : 'View details'}</small></span>
            <ChevronDown size={16} className={profileOpen ? 'profile-chevron open' : 'profile-chevron'} />
          </button>
          <button className="profile-signout" onClick={onSignOut}>Sign out</button>
          {showProfilePanel && <ProfilePanel key={profileAccountType} accountType={profileAccountType} profile={userProfile} availability={providerAvailability} onAvailabilityChange={setProviderAvailability} onClose={() => setProfileOpen(false)} onOpenAcceptedServices={onOpenAcceptedServices} incomingServiceRequest={userProfile?.incomingServiceRequest} acceptedServiceProvider={profileAccountType === 'Customer' ? acceptedServiceProvider || userProfile?.acceptedServiceProvider : null} onAcceptServiceRequest={onAcceptServiceRequest} onCancelServiceRequest={() => setUserProfile((current) => current ? { ...current, incomingServiceRequest: null } : current)} onCloseAcceptedServiceRequest={() => { setAcceptedServiceProvider(null); setUserProfile((current) => current ? { ...current, acceptedServiceProvider: null } : current) }} />}
        </div>
      </header>

      <div className="page-layout">
        <section className="category-section" id="categories">
          <div className="service-area"><p className="eyebrow">Service area</p><p>SPSR Nellore District, Andhra Pradesh</p></div>
          <div className="section-heading"><div><h2>All services</h2></div></div>
          <div className="category-grid">
            {categories.map((category) => <button className="category-card" key={category.name} onClick={() => openForm('customer')} disabled={!canAccessCustomerServices} aria-disabled={!canAccessCustomerServices}><span className="category-icon">{category.icon}</span><span className="category-name">{category.name}</span><ArrowRight className="card-arrow" size={17} /></button>)}
          </div>
        </section>

        <div className="main-content">
          <section className="hero" id="top">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-dot" />Required Services Near You</p>
              <h1>Useful hands,<br /><em>right nearby.</em></h1>
              <p className="hero-description">A simple local board for finding capable help and sharing the work you know best, one practical job at a time.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => openForm('customer')} disabled={!canAccessCustomerServices} aria-disabled={!canAccessCustomerServices}>Ask a Service<ArrowRight size={18} /></button>
                <button className="secondary-button" onClick={() => openForm('labour')} disabled={!canOpenProviderRegistration} aria-disabled={!canOpenProviderRegistration} title={!canOpenProviderRegistration ? 'Service provider registration is unavailable for this profile.' : undefined}>Service Provider<img className="service-provider-icon" src="/src/Service_Provider_Img.png" alt="" /></button>
              </div>
              <div className="payment-panel">
                <p className="eyebrow">Secure settlement</p>
                <button className="payment-button" onClick={() => openForm('payment')} disabled={!canAccessPaymentExchange} aria-disabled={!canAccessPaymentExchange} title={!canAccessPaymentExchange ? 'Payment exchange is unavailable for this profile.' : undefined}>Payment Exchange</button>
                <span>Track customer payment, service provider payout instantly.</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="image-frame">
                <img src="/src/Workers.png" alt="Local workers preparing tools for a repair" />
              </div>
            </div>
          </section>

          {canViewEmployerDirectories && <HomeDirectory requests={approvedRequests} />}
      <footer><span>© {new Date().getFullYear()} WorkNear</span><span>A small board for useful work</span></footer>
        </div>
      </div>


    </main>
  )
}
