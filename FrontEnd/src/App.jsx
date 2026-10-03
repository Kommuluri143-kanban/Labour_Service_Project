import { useEffect, useRef, useState } from 'react'
import { adminViewPaths, formPaths, getRouteState, homePathForProfile, pushPath } from './routes/routes.js'
import { HomePage } from './pages/Home/HomePage.jsx'
import { SignInPage } from './pages/SignIn/SignInPage.jsx'
import { SignUpPage } from './pages/SignUp/SignUpPage.jsx'
/*import { SignOutPage } from './pages/SignOut/SignOutPage.jsx'*/
import { AppHomePage } from './pages/AppHome/AppHomePage.jsx'
import { AdminPage } from './pages/Admin/AdminPage.jsx'
import { ServiceProvidersManagementPage } from './pages/ServiceProvidersManagement/ServiceProvidersManagementPage.jsx'
import { PaymentStatusPage } from './pages/PaymentStatus/PaymentStatusPage.jsx'
import { CustomersPage } from './pages/Customers/CustomersPage.jsx'
import { EmployersPage } from './pages/Employers/EmployersPage.jsx'
import { CustomerRequestPage } from './pages/CustomerRequest/CustomerRequestPage.jsx'
import { ServiceProviderRegistrationPage } from './pages/ServiceProviderRegistration/ServiceProviderRegistrationPage.jsx'
import { WNPocketPage } from './pages/WNPocket/WNPocketPage.jsx'
import { CloseAccountPage } from './pages/CloseAccount/CloseAccountPage.jsx'
import { ResignPage } from './pages/Resign/ResignPage.jsx'
import { ServiceHistoryPage } from './pages/ServiceHistory/ServiceHistoryPage.jsx'
import { ContactUsPage } from './pages/ContactUs/ContactUsPage.jsx'
import { PaymentExchangePage } from './pages/PaymentExchange/PaymentExchangePage.jsx'
import { FeedbackPage } from './pages/Feedback/FeedbackPage.jsx'
import { activeProfileKey, registeredProfilesKey, resignationRequestsKey, normalizeMobileNumber, readRegisteredProfiles, readActiveProfile } from './data/profileStore.js'
import { getAppCommissionRate } from './utils/finance.js'
import { WNPocketModal, ServiceHistoryModal, ResignationConfirmationModal, CloseAccountConfirmationModal } from './components/AppComponents.jsx'
import { RegistrationModal } from './components/RegistrationModal.jsx'

const approvedCustomerRequests = []

export default function App() {
  const initialRoute = useRef(getRouteState()).current
  const initialProfile = useRef(readActiveProfile()).current
  const [entryScreen, setEntryScreen] = useState(initialRoute.entryScreen)
  const [activeForm, setActiveForm] = useState(initialRoute.activeForm)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [resignationSubmitted, setResignationSubmitted] = useState(false)
  const [resignationError, setResignationError] = useState('')
  const [closeAccountDialogOpen, setCloseAccountDialogOpen] = useState(false)
  const [closeAccountError, setCloseAccountError] = useState('')
  const [wNPocketBalance, setWNPocketBalance] = useState(0)
  const [wNPocketActivity, setWNPocketActivity] = useState([])
  const [initialPaymentScenario, setInitialPaymentScenario] = useState('customer-to-app')
  const [submitted, setSubmitted] = useState(initialRoute.submitted)
  const [signedIn, setSignedIn] = useState(Boolean(initialProfile))
  const [userProfile, setUserProfile] = useState(initialProfile)
  const [profileAccountType, setProfileAccountType] = useState(initialProfile?.profileType || initialRoute.profileAccountType || 'Service Provider')
  const [providerAvailability, setProviderAvailability] = useState('Active')
  const [acceptedServiceProvider, setAcceptedServiceProvider] = useState(null)
  const [adminInitialView, setAdminInitialView] = useState(initialRoute.adminView)
  const canAccessCustomerServices = !signedIn || ['Customer', 'Service Provider', 'Employer', 'Admin'].includes(profileAccountType)
  const canOpenProviderRegistration = !signedIn || profileAccountType === 'Service Provider'
  const canAccessPaymentExchange = !signedIn || ['Customer', 'Service Provider', 'Employer', 'Admin'].includes(profileAccountType)
  const canAccessContactFeedback = !signedIn || ['Customer', 'Service Provider', 'Employer', 'Admin'].includes(profileAccountType)
  const canViewEmployerDirectories = signedIn && profileAccountType === 'Employer'
  const canViewServiceHistory = !signedIn || ['Customer', 'Service Provider', 'Admin', 'Employer'].includes(profileAccountType)
  const canAccessWNPocket = signedIn && profileAccountType === 'Service Provider'
  const canCloseAccount = signedIn && ['Customer', 'Service Provider'].includes(profileAccountType)
  const showProfilePanel = profileOpen
    || (signedIn && profileAccountType === 'Service Provider' && Boolean(userProfile?.incomingServiceRequest))
    || (signedIn && profileAccountType === 'Customer' && Boolean(acceptedServiceProvider || userProfile?.acceptedServiceProvider))

  const applyRouteState = (routeState) => {
    setEntryScreen(routeState.entryScreen)
    setActiveForm(routeState.activeForm)
    setSubmitted(routeState.submitted)
    setAdminInitialView(routeState.adminView)
    if (routeState.profileAccountType) setProfileAccountType(routeState.profileAccountType)
    setResignationSubmitted(false)
    setResignationError('')
    setCloseAccountDialogOpen(false)
    setCloseAccountError('')
    setMenuOpen(false)
    setProfileOpen(false)
  }

  const navigateTo = (path) => {
    pushPath(path)
    applyRouteState(getRouteState(path))
  }

  const openForm = (form, paymentScenario = 'customer-to-app') => {
    if (form === 'customer' && !canAccessCustomerServices) return
    if (form === 'labour' && !canOpenProviderRegistration) return
    if (form === 'payment' && !canAccessPaymentExchange) return
    if ((form === 'contact' || form === 'feedback') && !canAccessContactFeedback) return
    if (form === 'admin' && signedIn && profileAccountType !== 'Admin') return
    if (form === 'payment') setInitialPaymentScenario(paymentScenario)
    if (form === 'customer') setAcceptedServiceProvider(null)
    navigateTo(formPaths[form] || '/Home')
  }

  const recordCashInHandPayment = ({ amount, customerName }) => {
    if (!canAccessWNPocket) return
    const serviceAmount = Number(amount)
    const feeAmount = Number((serviceAmount * getAppCommissionRate(serviceAmount) / 100).toFixed(2))
    if (serviceAmount <= 0 || feeAmount <= 0) return
    setWNPocketBalance((balance) => Number((balance - feeAmount).toFixed(2)))
    setWNPocketActivity((activity) => [{
      id: `cash-fee-${Date.now()}`,
      customerName,
      serviceAmount,
      feeAmount,
      createdAt: new Date().toISOString(),
    }, ...activity])
  }

  const openResignationDialog = () => {
    if (!signedIn || profileAccountType !== 'Employer') return
    setResignationSubmitted(false)
    setResignationError('')
    navigateTo('/Resign')
  }

  const closeResignationDialog = () => {
    setResignationSubmitted(false)
    setResignationError('')
    navigateTo(homePathForProfile(profileAccountType))
  }

  const submitResignationRequest = () => {
    if (!signedIn || profileAccountType !== 'Employer') return
    let existingRequests = []
    try {
      const parsedRequests = JSON.parse(window.localStorage.getItem(resignationRequestsKey) || '[]')
      existingRequests = Array.isArray(parsedRequests) ? parsedRequests : []
    } catch {
      existingRequests = []
    }

    const request = {
      id: `resignation-${Date.now()}`,
      fullName: userProfile?.fullName || '',
      mobile: userProfile?.mobile || '',
      accountType: profileAccountType,
      status: 'Pending review',
      submittedAt: new Date().toISOString(),
    }
    try {
      window.localStorage.setItem(resignationRequestsKey, JSON.stringify([...existingRequests, request]))
      setResignationError('')
      setResignationSubmitted(true)
    } catch {
      setResignationError('Unable to submit your request right now. Please try again.')
    }
  }

  const openCloseAccountDialog = () => {
    setCloseAccountDialogOpen(true)
    setCloseAccountError('')
  }

  const closeCloseAccountDialog = () => {
    setCloseAccountDialogOpen(false)
    setCloseAccountError('')
    if (activeForm === 'close-account') navigateTo(homePathForProfile(profileAccountType))
  }

  const confirmCloseAccount = () => {
    if (!canCloseAccount) return
    let originalRegisteredProfiles = null
    try {
      originalRegisteredProfiles = window.localStorage.getItem(registeredProfilesKey)
      const parsedProfiles = JSON.parse(originalRegisteredProfiles || '[]')
      const registeredProfiles = Array.isArray(parsedProfiles) ? parsedProfiles : []
      const mobileKey = normalizeMobileNumber(userProfile?.mobile)
      const fullName = String(userProfile?.fullName || '').trim().toLocaleLowerCase()
      const remainingProfiles = registeredProfiles.filter((profile) => {
        const registeredMobileKey = normalizeMobileNumber(profile.mobile)
        if (mobileKey && registeredMobileKey) return registeredMobileKey !== mobileKey
        return !fullName || profile.profileType !== profileAccountType || String(profile.fullName || '').trim().toLocaleLowerCase() !== fullName
      })

      window.localStorage.setItem(registeredProfilesKey, JSON.stringify(remainingProfiles))
      window.localStorage.removeItem(activeProfileKey)
      setUserProfile(null)
      setSignedIn(false)
      setProfileOpen(false)
      setCloseAccountError('')
      setCloseAccountDialogOpen(false)
      navigateTo('/')
    } catch {
      if (originalRegisteredProfiles !== null) {
        try { window.localStorage.setItem(registeredProfilesKey, originalRegisteredProfiles) } catch { /* Keep the account closure failure visible if storage cannot be restored. */ }
      }
      setCloseAccountError('Unable to close your account right now. Please try again.')
    }
  }

  const closeForm = () => {
    navigateTo(signedIn ? homePathForProfile(profileAccountType) : '/Home')
  }

  const completeAuthentication = (authData) => {
    const enteredProfile = authData.profile
    let authenticatedProfile = enteredProfile
    const registeredProfiles = readRegisteredProfiles()

    if (authData.mode === 'signup') {
      authenticatedProfile = { ...enteredProfile, profileType: enteredProfile.profileType || 'Customer' }
      const mobileKey = normalizeMobileNumber(authenticatedProfile.mobile)
      if (mobileKey) {
        const nextProfiles = registeredProfiles.filter((profile) => normalizeMobileNumber(profile.mobile) !== mobileKey)
        nextProfiles.push(authenticatedProfile)
        try { window.localStorage.setItem(registeredProfilesKey, JSON.stringify(nextProfiles)) } catch { /* Keep the active development session usable when storage is unavailable. */ }
      }
    } else {
      const mobileKey = normalizeMobileNumber(enteredProfile.mobile)
      authenticatedProfile = registeredProfiles.find((profile) => normalizeMobileNumber(profile.mobile) === mobileKey) || {
        ...enteredProfile,
        profileType: 'Customer',
      }
    }

    try { window.localStorage.setItem(activeProfileKey, JSON.stringify(authenticatedProfile)) } catch { /* Keep the active development session usable when storage is unavailable. */ }
    setUserProfile(authenticatedProfile)
    setProfileAccountType(authenticatedProfile.profileType)
    setSignedIn(true)
    navigateTo(homePathForProfile(authenticatedProfile.profileType))
  }

  const clearSession = () => {
    try { window.localStorage.removeItem(activeProfileKey) } catch { /* Ignore storage failures during sign out. */ }
    setUserProfile(null)
    setSignedIn(false)
  }

  const handleAdminSuccess = () => {
    navigateTo(adminViewPaths.providers)
  }

  const handleAdminViewChange = (view) => {
    navigateTo(adminViewPaths[view] || adminViewPaths.providers)
  }

  const handleHomeSignOut = () => {
    clearSession()
    navigateTo('/SignOut')
  }

  useEffect(() => {
    const handlePopState = () => applyRouteState(getRouteState())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const canAccessAdmin = !signedIn || profileAccountType === 'Admin'
  const registrationProps = {
    submitted,
    setSubmitted,
    requesterProfile: userProfile,
    onSignedIn: () => { setSignedIn(true); if (!signedIn && activeForm === 'customer') setProfileAccountType('Customer') },
    onClose: closeForm,
    initialAdminView: adminInitialView,
    initialPaymentScenario,
    onCashInHandPaymentComplete: recordCashInHandPayment,
    onAdminSuccess: handleAdminSuccess,
    onAdminViewChange: handleAdminViewChange,
  }
  const homePageProps = {
    menuOpen, setMenuOpen, profileOpen, setProfileOpen, signedIn, profileAccountType, userProfile,
    providerAvailability, setProviderAvailability, acceptedServiceProvider, setAcceptedServiceProvider,
    setUserProfile, canOpenProviderRegistration, canViewServiceHistory, canViewEmployerDirectories,
    canAccessCustomerServices, canAccessPaymentExchange, canAccessContactFeedback, canAccessWNPocket,
    canCloseAccount, showProfilePanel, openForm,
    onOpenServiceHistory: () => navigateTo('/Servicehistory'),
    onOpenWNPocket: () => navigateTo('/WNPocket'),
    onOpenCloseAccount: openCloseAccountDialog,
    onOpenResign: openResignationDialog,
    onSignOut: handleHomeSignOut,
    approvedRequests: approvedCustomerRequests,
  }
  const renderRegistration = (type) => <RegistrationModal type={type} {...registrationProps} />

  if (entryScreen === 'landing') return <HomePage onSignIn={() => navigateTo('/SignIn')} onSignUp={() => navigateTo('/SignUp')} />
  if (entryScreen === 'signout') return <SignOutPage onHome={() => navigateTo('/')} onSignIn={() => navigateTo('/SignIn')} />
  if (entryScreen === 'signin') return <SignInPage onBack={() => navigateTo('/')} onSuccess={completeAuthentication} />
  if (entryScreen === 'signup') return <SignUpPage onBack={() => navigateTo('/')} onSuccess={completeAuthentication} />

  if (activeForm === 'admin') {
    if (!canAccessAdmin) return <AppHomePage {...homePageProps} />
    const adminContent = renderRegistration('admin')
    if (!submitted) return <AdminPage>{adminContent}</AdminPage>
    if (adminInitialView === 'payments') return <PaymentStatusPage>{adminContent}</PaymentStatusPage>
    if (adminInitialView === 'employers') return <EmployersPage>{adminContent}</EmployersPage>
    if (adminInitialView === 'service-providers') return <CustomersPage>{adminContent}</CustomersPage>
    return <ServiceProvidersManagementPage>{adminContent}</ServiceProvidersManagementPage>
  }
  if (activeForm === 'customer') return canAccessCustomerServices ? <CustomerRequestPage>{renderRegistration('customer')}</CustomerRequestPage> : <AppHomePage {...homePageProps} />
  if (activeForm === 'labour') return canOpenProviderRegistration ? <ServiceProviderRegistrationPage>{renderRegistration('labour')}</ServiceProviderRegistrationPage> : <AppHomePage {...homePageProps} />
  if (activeForm === 'contact') return canAccessContactFeedback ? <ContactUsPage>{renderRegistration('contact')}</ContactUsPage> : <AppHomePage {...homePageProps} />
  if (activeForm === 'feedback') return canAccessContactFeedback ? <FeedbackPage>{renderRegistration('feedback')}</FeedbackPage> : <AppHomePage {...homePageProps} />
  if (activeForm === 'payment') return canAccessPaymentExchange ? <PaymentExchangePage>{renderRegistration('payment')}</PaymentExchangePage> : <AppHomePage {...homePageProps} />
  if (activeForm === 'wnpocket') return canAccessWNPocket ? <WNPocketPage><WNPocketModal profile={userProfile} balance={wNPocketBalance} activity={wNPocketActivity} onOpenCashInHandPayment={() => openForm('payment', 'provider-to-app')} onClose={() => navigateTo('/Home')} /></WNPocketPage> : <AppHomePage {...homePageProps} />
  if (activeForm === 'close-account') return canCloseAccount ? <CloseAccountPage><CloseAccountConfirmationModal error={closeAccountError} onConfirm={confirmCloseAccount} onClose={closeCloseAccountDialog} /></CloseAccountPage> : <AppHomePage {...homePageProps} />
  if (activeForm === 'resign') return signedIn && profileAccountType === 'Employer' ? <ResignPage><ResignationConfirmationModal accountType={profileAccountType} submitted={resignationSubmitted} error={resignationError} onConfirm={submitResignationRequest} onClose={closeResignationDialog} /></ResignPage> : <AppHomePage {...homePageProps} />
  if (activeForm === 'service-history') return canViewServiceHistory ? <ServiceHistoryPage><ServiceHistoryModal accountType={profileAccountType} onClose={() => navigateTo(homePathForProfile(profileAccountType))} /></ServiceHistoryPage> : <AppHomePage {...homePageProps} />

  return <>
    <AppHomePage {...homePageProps} />
    {closeAccountDialogOpen && <CloseAccountConfirmationModal error={closeAccountError} onConfirm={confirmCloseAccount} onClose={closeCloseAccountDialog} />}
  </>
}
