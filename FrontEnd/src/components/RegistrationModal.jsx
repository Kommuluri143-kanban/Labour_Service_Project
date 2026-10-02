import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, ChevronDown, Mic, MicOff, RefreshCw, X } from 'lucide-react'
import { labourTypes, marriageFunctionSpecialists, musicianTypes, farmLaborTasks, vehicleSpecialists, drivingSpecialists, transportSpecialists, loaderSpecialists, farmingSpecialists, homeServiceSpecialists, constructionSpecialists, getSpecialistOptions, matchVoiceChoice, paymentScenarios } from '../data/serviceData.js'
import { CustomerRequestProgress } from './AppComponents.jsx'
import { AdminDashboard } from './admin/AdminDashboard.jsx'
import { getAppCommissionRate } from '../utils/finance.js'

export function RegistrationModal({ type, submitted, setSubmitted, requesterProfile, onSignedIn, onClose, initialAdminView, initialPaymentScenario = 'customer-to-app', onCashInHandPaymentComplete, onAdminSuccess, onAdminViewChange }) {
  const isLabour = type === 'labour'
  const isContact = type === 'contact'
  const isFeedback = type === 'feedback'
  const isAdmin = type === 'admin'
  const isPayment = type === 'payment'
  const isCustomer = type === 'customer'
  const [selectedMandal, setSelectedMandal] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedMusicianType, setSelectedMusicianType] = useState('')
  const [selectedMultiServices, setSelectedMultiServices] = useState([])
  const [selectedFarmLaborTask, setSelectedFarmLaborTask] = useState('')
  const [customerName, setCustomerName] = useState(() => isPayment ? '' : requesterProfile?.fullName || '')
  const [customerAddress, setCustomerAddress] = useState(() => [requesterProfile?.village, requesterProfile?.mandal, requesterProfile?.division].filter(Boolean).join(', '))
  const [customerCoordinates, setCustomerCoordinates] = useState('')
  const [customerLocationError, setCustomerLocationError] = useState('')
  const [customerRequestStatus, setCustomerRequestStatus] = useState('searching')
  const [providerName, setProviderName] = useState(() => requesterProfile?.profileType === 'Service Provider' ? requesterProfile.fullName || '' : '')
  const [isListening, setIsListening] = useState(false)
  const [listeningTarget, setListeningTarget] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const recognitionRef = useRef(null)
  const [adminOtp, setAdminOtp] = useState('')
  const [adminOtpStep, setAdminOtpStep] = useState(false)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaCode, setCaptchaCode] = useState(() => Math.random().toString(36).slice(2, 7).toUpperCase())
  const [captchaError, setCaptchaError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentScenario, setPaymentScenario] = useState(initialPaymentScenario)
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentScenario === 'provider-to-app' ? 'Cash in hand' : 'QR scan')

  const refreshCaptcha = () => {
    setCaptchaCode(Math.random().toString(36).slice(2, 7).toUpperCase())
    setCaptchaAnswer('')
    setCaptchaError('')
  }

  const captureCustomerLocation = () => {
    if (!navigator.geolocation) {
      setCustomerLocationError('Location access is not available in this browser. Enter the address manually.')
      return
    }
    setCustomerLocationError('')
    navigator.geolocation.getCurrentPosition((position) => {
      setCustomerCoordinates(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`)
    }, () => {
      setCustomerLocationError('Could not get your location. Enter the address manually.')
    }, { enableHighAccuracy: true, timeout: 10000 })
  }

  useEffect(() => {
    if (!isAdmin || adminOtpStep) return undefined
    const refreshTimer = window.setInterval(refreshCaptcha, 60 * 1000)
    return () => window.clearInterval(refreshTimer)
  }, [isAdmin, adminOtpStep])

  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  const startVoiceInput = (target) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser.')
      return
    }

    if (recognitionRef.current && listeningTarget === target) {
      recognitionRef.current.stop()
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
        if (target === 'service' || target === 'specialty') {
          const choices = target === 'service'
            ? labourTypes.map((value) => ({ label: value, value }))
            : getSpecialistOptions(selectedService).filter((choice) => !choice.disabled)
          const match = matchVoiceChoice(transcript, choices)
          if (match && target === 'service') {
            setSelectedService(match.value)
            setSelectedSpecialty('')
            setSelectedMusicianType('')
            setSelectedMultiServices([])
            setSelectedFarmLaborTask('')
            setVoiceError('')
          } else if (match) {
            setSelectedSpecialty(match.value)
            setSelectedMusicianType('')
            setSelectedMultiServices([])
            setSelectedFarmLaborTask('')
            setVoiceError('')
          } else {
            setVoiceError('No matching option heard. Please try again or choose from the list.')
          }
        }
      }
    }

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        setIsListening(false)
        setListeningTarget('')
      }
    }
    recognition.onerror = () => {
      setVoiceError('Voice input is unavailable right now.')
      setIsListening(false)
      setListeningTarget('')
    }

    recognitionRef.current = recognition
    setIsListening(true)
    setListeningTarget(target)
    setVoiceError('')
    recognition.start()
  }

  const numericAmount = Number(amount || 0)
  const commissionRate = getAppCommissionRate(numericAmount)
  const appCommission = numericAmount * commissionRate / 100
  const providerPayout = numericAmount - appCommission
  const activeScenarioMethods = paymentScenarios.find((scenario) => scenario.id === paymentScenario)?.methods || []
  const customerPays = paymentScenario === 'customer-to-app' || paymentScenario === 'provider-to-app' ? numericAmount : 0
  const appCollects = paymentScenario === 'customer-to-app' ? appCommission : paymentScenario === 'provider-to-app' ? appCommission : 0
  const providerReceives = paymentScenario === 'customer-to-app' ? providerPayout : paymentScenario === 'provider-to-app' ? numericAmount : 0
  const isWalletCashInHandPayment = isPayment && paymentScenario === 'provider-to-app' && paymentMethod === 'Cash in hand' && requesterProfile?.profileType === 'Service Provider' && numericAmount > 0
  const customerPaysLabel = paymentScenario === 'customer-to-app' ? 'Customer pays → Platform' : 'Customer pays → Service Provider'
  const settlementLabel = paymentScenario === 'customer-to-app' ? 'Platform pays → Service Provider' : isWalletCashInHandPayment ? 'Automatic WNPocket deduction' : 'Service Provider pays → Platform'
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
    <section className={isAdmin ? 'modal admin-modal' : 'modal'} role="dialog" aria-modal="true" aria-labelledby="modal-title" onSubmitCapture={() => { if (isWalletCashInHandPayment) onCashInHandPaymentComplete?.({ amount: numericAmount, customerName }) }}>
      {!isAdmin && <button className="close-button" onClick={onClose} aria-label="Close registration form"><X size={20} /></button>}
      {submitted ? <div className="success-state admin-dashboard">
        <span className="success-icon"><Check size={26} /></span>
        <p className="eyebrow">{isPayment ? 'Payment complete' : isAdmin ? 'Admin dashboard' : isFeedback ? 'Feedback received' : isContact ? 'Message received' : isCustomer ? 'Request submitted' : 'You’re on the list'}</p>
        <h2>{isPayment ? 'Payment exchange success' : isAdmin ? 'Hello, Admin.' : isFeedback ? 'Thanks for your feedback.' : isContact ? 'Thanks for contacting us.' : isCustomer ? 'We’re finding a nearby Service Provider' : 'Thanks for reaching out.'}</h2>
        {isPayment ? <div className="payment-summary">
          <div><span>Flow</span><strong>{paymentScenarios.find((scenario) => scenario.id === paymentScenario)?.label}</strong></div>
          <div><span>Method</span><strong>{paymentMethod}</strong></div>
          <div><span>{customerPaysLabel}</span><strong>₹{customerPays.toLocaleString('en-IN')}</strong></div>
          <div><span>Provider receives</span><strong>₹{providerReceives.toLocaleString('en-IN')}</strong></div>
          <div><span>Platform fee</span><strong>₹{appCollects.toLocaleString('en-IN')}</strong></div>  
          <div><span>{settlementLabel}</span><strong>₹{settlementAmount.toLocaleString('en-IN')}</strong></div>
        </div> : isAdmin ? <AdminDashboard initialView={initialAdminView} onViewChange={onAdminViewChange} onHome={onClose} /> : isCustomer ? <div className="request-submitted-summary" role="status">
          <p>A nearby active Service Provider will be notified. You’ll see their name and address here after they accept.</p>
          <CustomerRequestProgress status={customerRequestStatus} onRetry={() => { setCustomerRequestStatus('searching'); setSubmitted(false) }} />
          <dl className="request-alert-details">
            <div><dt>Customer Name</dt><dd>{customerName}</dd></div>
            <div><dt>Customer Address</dt><dd>{customerAddress}</dd></div>
            {customerCoordinates && <div><dt>Location coordinates</dt><dd>{customerCoordinates}</dd></div>}
          </dl>
        </div> : <p>{isFeedback ? 'Your thoughts help us improve the local work board.' : isContact ? 'We’ve received your message and will get back to you shortly.' : 'We’ve received your details and will be in touch shortly.'}</p>}
        {!isAdmin && <button className="primary-button" onClick={onClose}>Back to home <ArrowRight size={18} /></button>}
      </div> : <><p className="eyebrow">{isPayment ? 'Secure transfer' : isAdmin ? adminOtpStep ? 'Mobile verification' : 'Secure access' : isFeedback ? 'Help us improve' : isContact ? 'Get in touch' : isLabour }</p><h2 id="modal-title">{isPayment ? 'Payment Exchange' : isAdmin ? adminOtpStep ? 'Enter your OTP' : 'Admin login' : isFeedback ? 'Tell us what you think' : isContact ? 'How can we help?' : isLabour ? 'Register as a service provider' : 'Tell us what you need'}</h2><p className="modal-intro">{isPayment ? 'Choose the payment flow, method, and commission split for a customer and service provider transaction.' : isAdmin ? adminOtpStep ? 'Enter the one-time password sent to your registered mobile number.' : 'Sign in with your email, password, and CAPTCHA to continue.' : isFeedback ? 'Share a quick rating and note about your experience.' : isContact ? 'Send us a note and our team will respond shortly.' : isLabour ? 'Share a few details and start finding work near you.' : 'We’ll help you connect with a trusted professional nearby.'}</p><form onSubmit={(event) => { event.preventDefault(); if (isAdmin && !adminOtpStep) { if (captchaAnswer.trim().toUpperCase() !== captchaCode) { setCaptchaError('CAPTCHA does not match.'); return } setAdminOtpStep(true); return } if (isAdmin && !/^\d{6}$/.test(adminOtp)) { setOtpError('Enter the 6-digit OTP sent to your mobile.'); return } if (!isLabour && !isContact && !isFeedback && !isPayment) onSignedIn(); if (isAdmin) onAdminSuccess(); setSubmitted(true) }}>
        {isPayment ? <>
          <label>Payment scenario<select required value={paymentScenario} onChange={(event) => {
            const nextScenario = event.target.value
            setPaymentScenario(nextScenario)
            const nextMethods = paymentScenarios.find((scenario) => scenario.id === nextScenario)?.methods || []
            setPaymentMethod(nextMethods[0] || '')
          }}><option value="" disabled>Select a scenario</option>{paymentScenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.label}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
          <label>Payment method<select required value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="" disabled>Select a method</option>{activeScenarioMethods.map((method) => <option key={method} value={method}>{method}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
          <label>Customer name<input required type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Enter customer name" /></label>
          <label>Service provider name<input required type="text" value={providerName} readOnly={requesterProfile?.profileType === 'Service Provider'} onChange={(event) => setProviderName(event.target.value)} placeholder="Enter service provider name" /></label>
          <label>Service amount<input required type="number" min="0" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Enter service amount" /></label>
          {(paymentScenario === 'customer-to-app' || paymentScenario === 'provider-to-app') && <label>App commission (%)<input required type="number" value={commissionRate} readOnly /></label>}
          <div className="payment-breakdown">
            <div><span>{customerPaysLabel}</span><strong>₹{customerPays.toLocaleString('en-IN')}</strong></div>
            <div><span>Service Provider receives</span><strong>₹{providerReceives.toLocaleString('en-IN')}</strong></div>
            <div><span>Platform fee</span><strong>₹{appCollects.toLocaleString('en-IN')}</strong></div>
            <div><span>{settlementLabel}</span><strong>₹{settlementAmount.toLocaleString('en-IN')}</strong></div>
          </div>
        </> : isAdmin && !adminOtpStep ? <>
          <label>Admin email<input required type="email" placeholder="Enter your admin email" /></label>
          <label>Password<input required type="password" placeholder="Enter password" /></label>
          <div className="captcha-field"><div className="captcha-code-row"><strong>{captchaCode}</strong><button className="captcha-refresh" type="button" onClick={refreshCaptcha} aria-label="Refresh CAPTCHA" title="Refresh CAPTCHA"><RefreshCw size={15} /></button></div><input required type="text" value={captchaAnswer} onChange={(event) => { setCaptchaAnswer(event.target.value); setCaptchaError('') }} placeholder="Enter CAPTCHA" aria-label="Enter CAPTCHA" />{captchaError && <small>{captchaError}</small>}</div>
        </> : isAdmin ? <>
          <div className="otp-notice">OTP sent to your registered mobile number.</div>
          <label>One-time password<input required type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={adminOtp} onChange={(event) => { setAdminOtp(event.target.value.replace(/\D/g, '')); setOtpError('') }} placeholder="Enter 6-digit OTP" />{otpError && <small className="otp-error">{otpError}</small>}</label>
        </> : null}
        {isLabour ? <>
          <label>What service do you offer<select required value={selectedService} onChange={(event) => { setSelectedService(event.target.value); setSelectedSpecialty(''); setSelectedMusicianType(''); setSelectedMultiServices([]); setSelectedFarmLaborTask('') }}><option value="" disabled>Select your service</option>{labourTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
          {selectedService === 'Electricians' && <label>Electrician specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>Home Specialist</option><option>Farming Motors Specialist</option><option>Both Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Vehicle & Machinery Service Providers' && <label>Vehicle specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option>{vehicleSpecialists.map((item) => <option key={item.name} value={item.value || item.name} disabled={item.divider}>{item.divider ? item.name : `${item.name} → ${item.description}`}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Driving Service Providers' && <label>Driving specialist<select required defaultValue=""><option value="" disabled>Select a driving service</option>{drivingSpecialists.map((item) => <option key={item.name} value={item.name}>{item.name} → {item.description}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Transport Service Providers' && <label>Transport service type<select required value={selectedSpecialty} onChange={(event) => setSelectedSpecialty(event.target.value)}><option value="" disabled>Select a transport service</option>{transportSpecialists.map((item) => <option key={item.name} value={item.name}>{item.name} → {item.description}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Loader Service Providers' && <label>Loader service type<select required value={selectedSpecialty} onChange={(event) => setSelectedSpecialty(event.target.value)}><option value="" disabled>Select a loader service</option>{loaderSpecialists.map((item) => <option key={item.name} value={item.name}>{item.name} → {item.description}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Home Service Providers' && <label>Home service type<select required defaultValue=""><option value="" disabled>Select a home service</option>{homeServiceSpecialists.map((item) => <option key={item.name} value={item.name}>{item.name} → {item.description}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Farming Service Providers' && <label>Farming specialist<select required value={selectedSpecialty} onChange={(event) => { setSelectedSpecialty(event.target.value); setSelectedFarmLaborTask(''); setSelectedMultiServices([]) }}><option value="" disabled>Select a specialization</option>{farmingSpecialists.map((item) => <option key={item.name} value={item.value || item.name} disabled={item.divider}>{item.divider ? item.name : item.description ? `${item.name} → ${item.description}` : item.name}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Farming Service Providers' && selectedSpecialty === 'Multi-Select' && <fieldset className="service-multiselect"><legend>Service types</legend>{farmingSpecialists.filter((item) => !item.divider && item.value !== 'Multi-Select').map((item, index) => <label className="service-multiselect-option" key={item.name}><input type="checkbox" checked={selectedMultiServices.includes(item.name)} required={selectedMultiServices.length === 0 && index === 0} onChange={(event) => { const isChecked = event.target.checked; setSelectedMultiServices((current) => isChecked ? [...current, item.name] : current.filter((service) => service !== item.name)); if (item.name === 'Farm Laborers' && !isChecked) setSelectedFarmLaborTask('') }} /><span>{item.name}</span></label>)}</fieldset>}
          {selectedService === 'Farming Service Providers' && (selectedSpecialty === 'Farm Laborers' || (selectedSpecialty === 'Multi-Select' && selectedMultiServices.includes('Farm Laborers'))) && <label>Farm labor task<select required value={selectedFarmLaborTask} onChange={(event) => setSelectedFarmLaborTask(event.target.value)}><option value="" disabled>Select a task</option>{farmLaborTasks.map((task) => <option key={task} value={task}>{task}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Construction Service Providers' && <label>Construction specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option>{constructionSpecialists.map((item) => <option key={item.name} value={item.value || item.name} disabled={item.divider}>{item.divider ? item.name : `${item.name} → ${item.description}`}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Marriage & Other Functions Service Providers' && <label>Marriage/function specialist<select required value={selectedSpecialty} onChange={(event) => { setSelectedSpecialty(event.target.value); setSelectedMusicianType(''); setSelectedMultiServices([]) }}><option value="" disabled>Select a specialization</option>{marriageFunctionSpecialists.map((item) => <option key={item.name} value={item.value || item.name} disabled={item.divider}>{item.divider ? item.name : `${item.name} → ${item.description}`}</option>)}<option value="Multi-Select">★ Multi-Select Option</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Marriage & Other Functions Service Providers' && selectedSpecialty === 'Multi-Select' && <fieldset className="service-multiselect"><legend>Service types</legend>{marriageFunctionSpecialists.filter((item) => !item.divider && item.value !== 'Specialist').map((item, index) => <label className="service-multiselect-option" key={item.name}><input type="checkbox" checked={selectedMultiServices.includes(item.name)} required={selectedMultiServices.length === 0 && index === 0} onChange={(event) => { const isChecked = event.target.checked; setSelectedMultiServices((current) => isChecked ? [...current, item.name] : current.filter((service) => service !== item.name)); if (item.name === 'Musicians' && !isChecked) setSelectedMusicianType('') }} /><span>{item.name}</span></label>)}</fieldset>}
          {selectedService === 'Marriage & Other Functions Service Providers' && (selectedSpecialty === 'Musicians' || (selectedSpecialty === 'Multi-Select' && selectedMultiServices.includes('Musicians'))) && <label>Choose a music type<select required value={selectedMusicianType} onChange={(event) => setSelectedMusicianType(event.target.value)}><option value="" disabled>Select a music type</option>{musicianTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
        </> : isContact ? <><label>Your message<textarea required placeholder="Tell us how we can help" /></label></> : isFeedback ? <><label>How would you rate your experience?<select required defaultValue=""><option value="" disabled>Select a rating</option><option>Excellent</option><option>Good</option><option>Needs improvement</option></select><ChevronDown className="select-icon" size={16} /></label><label>Your feedback<textarea required placeholder="Share your thoughts" /></label></> : isCustomer ? <>
          <label>Customer Name<input required type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Enter your name" /></label>
          <label>Customer Address<textarea required rows="2" value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="Enter the service location address" /></label>
          <div className="request-location-tools">
            <button type="button" className="location-button" onClick={captureCustomerLocation}>Use my current location</button>
            {customerCoordinates && <small>Location captured: {customerCoordinates}</small>}
            {customerLocationError && <small className="voice-error">{customerLocationError}</small>}
            <small>Share the service location so the nearest available provider can be identified.</small>
          </div>
          <label>What do you need help with?<div className="voice-select-row"><select required value={selectedService} onChange={(event) => { setSelectedService(event.target.value); setSelectedSpecialty(''); setSelectedMusicianType(''); setSelectedMultiServices([]); setSelectedFarmLaborTask(''); setVoiceError('') }}><option value="" disabled>Select a service</option>{labourTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown className="select-icon" size={16} /><button className={isListening && listeningTarget === 'service' ? 'voice-button listening' : 'voice-button'} type="button" onClick={() => startVoiceInput('service')} aria-label="Choose a service by voice" title="Choose a service by voice">{isListening && listeningTarget === 'service' ? <MicOff size={16} /> : <Mic size={16} />}</button></div></label>
          {selectedService && <label>Choose a service type<div className="voice-select-row"><select required value={selectedSpecialty} onChange={(event) => { setSelectedSpecialty(event.target.value); setSelectedMusicianType(''); setSelectedMultiServices([]); setSelectedFarmLaborTask(''); setVoiceError('') }}><option value="" disabled>Select a service type</option>{getSpecialistOptions(selectedService).map((item) => <option key={item.value} value={item.value} disabled={item.disabled}>{item.disabled ? item.label : item.description ? `${item.label} → ${item.description}` : item.label}</option>)}{selectedService === 'Marriage & Other Functions Service Providers' && <option value="Multi-Select">★ Multi-Select Option</option>}</select><ChevronDown className="select-icon" size={16} /><button className={isListening && listeningTarget === 'specialty' ? 'voice-button listening' : 'voice-button'} type="button" onClick={() => startVoiceInput('specialty')} aria-label="Choose a service type by voice" title="Choose a service type by voice">{isListening && listeningTarget === 'specialty' ? <MicOff size={16} /> : <Mic size={16} />}</button></div></label>}
          {selectedService === 'Farming Service Providers' && selectedSpecialty === 'Multi-Select' && <fieldset className="service-multiselect"><legend>Service types</legend>{farmingSpecialists.filter((item) => !item.divider && item.value !== 'Multi-Select').map((item, index) => <label className="service-multiselect-option" key={item.name}><input type="checkbox" checked={selectedMultiServices.includes(item.name)} required={selectedMultiServices.length === 0 && index === 0} onChange={(event) => { const isChecked = event.target.checked; setSelectedMultiServices((current) => isChecked ? [...current, item.name] : current.filter((service) => service !== item.name)); if (item.name === 'Farm Laborers' && !isChecked) setSelectedFarmLaborTask('') }} /><span>{item.name}</span></label>)}</fieldset>}
          {selectedService === 'Farming Service Providers' && (selectedSpecialty === 'Farm Laborers' || (selectedSpecialty === 'Multi-Select' && selectedMultiServices.includes('Farm Laborers'))) && <label>Farm labor task<select required value={selectedFarmLaborTask} onChange={(event) => setSelectedFarmLaborTask(event.target.value)}><option value="" disabled>Select a task</option>{farmLaborTasks.map((task) => <option key={task} value={task}>{task}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {isCustomer && selectedService === 'Marriage & Other Functions Service Providers' && selectedSpecialty === 'Multi-Select' && <fieldset className="service-multiselect"><legend>Service types</legend>{marriageFunctionSpecialists.filter((item) => !item.divider && item.value !== 'Specialist').map((item, index) => <label className="service-multiselect-option" key={item.name}><input type="checkbox" checked={selectedMultiServices.includes(item.name)} required={selectedMultiServices.length === 0 && index === 0} onChange={(event) => { const isChecked = event.target.checked; setSelectedMultiServices((current) => isChecked ? [...current, item.name] : current.filter((service) => service !== item.name)); if (item.name === 'Musicians' && !isChecked) setSelectedMusicianType('') }} /><span>{item.name}</span></label>)}</fieldset>}
          {(selectedSpecialty === 'Musicians' || (isCustomer && selectedService === 'Marriage & Other Functions Service Providers' && selectedSpecialty === 'Multi-Select' && selectedMultiServices.includes('Musicians'))) && <label>Choose a music type<select required value={selectedMusicianType} onChange={(event) => setSelectedMusicianType(event.target.value)}><option value="" disabled>Select a music type</option>{musicianTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {voiceError && <small className="voice-error">{voiceError}</small>}
        </> : null}
        <button className="primary-button form-submit" type="submit">{isPayment ? 'Process payment' : isAdmin ? adminOtpStep ? 'Verify OTP' : 'Continue to OTP' : isFeedback ? 'Send feedback' : isContact ? 'Send message' : isLabour ? 'Create my profile' : 'Find a professional'} <ArrowRight size={18} /></button>
        {isAdmin && <button className="signin-back" type="button" onClick={handleAdminBack}>&lt;- Back</button>}
      </form></>}
    </section>
  </div>
}
