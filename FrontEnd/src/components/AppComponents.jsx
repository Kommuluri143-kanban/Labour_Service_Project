import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, Check, ChevronDown, Pencil, RefreshCw, UserRound, X } from 'lucide-react'
import { toDateInputValue, getSixMonthsAgo, formatServiceDate } from '../utils/dateUtils.js'
import { playRequestAlertTone } from '../utils/audio.js'

export function ProfilePanel({ accountType, profile, availability, onAvailabilityChange, onClose, incomingServiceRequest = null, acceptedServiceProvider = null, onAcceptServiceRequest, onCancelServiceRequest, onCloseAcceptedServiceRequest }) {
  const role = accountType || 'Customer'
  const isProvider = role === 'Service Provider'
  const isCustomer = role === 'Customer'
  const name = profile?.fullName || (isProvider ? 'Service Provider' : isCustomer ? 'Customer' : role)
  const mobile = profile?.mobile || 'Mobile number not provided'
  const [serviceAmount, setServiceAmount] = useState('')
  const [serviceOfferStatus, setServiceOfferStatus] = useState('pending')
  const [requestSoundEnabled, setRequestSoundEnabled] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState(() => typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'unsupported')
  const [image, setImage] = useState(accountType === 'Service Provider' ? '/src/Service_Provider_Img.png' : '/src/Workers.png')
  const fallbackImage = isProvider ? '/src/Service_Provider_Img.png' : '/src/Workers.png'

  const enableDeviceNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported')
      return
    }
    try { setNotificationPermission(await window.Notification.requestPermission()) } catch { setNotificationPermission('denied') }
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  return <section className="profile-panel" id="profile-panel" aria-label="Profile details">
    <div className="profile-panel-heading"><div><p className="eyebrow">Your account</p><h2>Profile details</h2></div><div className="profile-panel-actions"><button className="profile-close" onClick={onClose} aria-label="Close profile"><X size={17} /></button></div></div>
    <div className="profile-preview">
      <div className="profile-avatar-wrap">
        <img src={image || fallbackImage} alt={`${role} profile`} />
        <label className="profile-image-edit" title="Change profile image">
          <Pencil size={13} aria-hidden="true" />
          <input type="file" accept="image/*" aria-label="Change profile image" onChange={handleImageChange} />
        </label>
      </div>
      <div><strong>{name || 'Your name'}</strong><span>{role}</span><small>{mobile || 'Mobile Number'}</small></div>
    </div>
    <div className="profile-fields">
      {isProvider && <label>Request accept status<select value={availability} onChange={(event) => onAvailabilityChange(event.target.value)}><option>Active</option><option>Inactive</option></select><ChevronDown className="select-icon" size={16} /></label>}
      {(isProvider || isCustomer) && <ProfileRequestActions role={role} serviceAmount={serviceAmount} onServiceAmountChange={setServiceAmount} serviceOfferStatus={serviceOfferStatus} onServiceOfferStatusChange={setServiceOfferStatus} />}
    </div>
    {isProvider && <>
      <section className="incoming-request-empty" aria-live="polite"><strong>Incoming service requests</strong><p>When a request is assigned to you, an alert will show the Customer Name and Customer Address here.</p></section>
      <section className="provider-alert-preferences" aria-label="Service request notifications">
        <strong>Request notifications</strong>
        <label><input type="checkbox" checked={requestSoundEnabled} onChange={(event) => setRequestSoundEnabled(event.target.checked)} /> Play an alert sound for new requests</label>
        <button type="button" onClick={enableDeviceNotifications} disabled={notificationPermission === 'granted'}>{notificationPermission === 'granted' ? 'Device notifications enabled' : 'Enable device notifications'}</button>
        {notificationPermission === 'denied' && <small>Notifications are blocked in browser settings.</small>}
        {notificationPermission === 'unsupported' && <small>Device notifications are not supported in this browser.</small>}
      </section>
    </>}
    <div className={isProvider && availability === 'Active' ? 'availability-note active' : 'availability-note'}><span className="status-dot" />{isProvider ? availability === 'Active' ? 'Accepting new service requests' : 'Not accepting service requests' : isCustomer ? 'Customer profile ready' : `${role} profile active`}</div>
    {isProvider && incomingServiceRequest && <ProviderIncomingRequestModal request={incomingServiceRequest} playSound={requestSoundEnabled} onAccept={onAcceptServiceRequest} onCancel={onCancelServiceRequest} />}
    {isCustomer && acceptedServiceProvider && <CustomerProviderAcceptedModal provider={acceptedServiceProvider} onClose={onCloseAcceptedServiceRequest} />}
  </section>
}

export function WNPocketModal({ profile, balance, activity, onOpenCashInHandPayment, onClose }) {
  const [verified, setVerified] = useState(false)
  const [demoOtp, setDemoOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [activeView, setActiveView] = useState('overview')
  const [amount, setAmount] = useState('')
  const [paymentApp, setPaymentApp] = useState('PhonePe')
  const [actionMessage, setActionMessage] = useState('')
  const mobileDigits = String(profile?.mobile || '').replace(/\D/g, '')
  const maskedMobile = mobileDigits.length >= 4 ? `•••• ••• ${mobileDigits.slice(-4)}` : 'your registered mobile number'
  const amountValue = Number(amount) || 0
  const formatWalletAmount = (value) => `${value < 0 ? '-' : ''}₹${Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  const sendDemoOtp = () => {
    setDemoOtp(String(Math.floor(100000 + Math.random() * 900000)))
    setEnteredOtp('')
    setOtpError('')
  }

  const verifyDemoOtp = (event) => {
    event.preventDefault()
    if (enteredOtp !== demoOtp) {
      setOtpError('The code does not match. Please try again.')
      return
    }
    setVerified(true)
    setOtpError('')
  }

  const selectView = (view) => {
    setActiveView(view)
    setAmount('')
    setActionMessage('')
  }

  const startExternalPayment = (event) => {
    event.preventDefault()
    setActionMessage(`${paymentApp} payment connection is a preview. No payment has been started.`)
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal wnpocket-modal" role="dialog" aria-modal="true" aria-labelledby="wnpocket-title">
      <button className="close-button" type="button" onClick={onClose} aria-label="Close WNPocket"><X size={20} /></button>
      <div className="wnpocket-heading">
        <div><p className="eyebrow">Service Provider Wallet</p><h2 id="wnpocket-title">WNPocket</h2></div>
      </div>
      {!verified ? <div className="wnpocket-otp-panel">
        <h3>Verify your mobile to view your balance</h3>
        <p>A one-time code will be sent to {maskedMobile} when SMS verification is connected.</p>
        {!demoOtp ? <button className="primary-button" type="button" onClick={sendDemoOtp}>Preview mobile OTP</button> : <form className="wnpocket-form" onSubmit={verifyDemoOtp}>
          <label>Mobile OTP<input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required value={enteredOtp} onChange={(event) => { setEnteredOtp(event.target.value.replace(/\D/g, '')); setOtpError('') }} placeholder="Enter 6-digit code" /></label>
          <p className="wnpocket-demo-code">Demo OTP: <strong>{demoOtp}</strong></p>
          <button className="primary-button" type="submit">Verify and view wallet</button>
          {otpError && <p className="wnpocket-error" role="alert">{otpError}</p>}
        </form>}
        <p className="wnpocket-preview-note">UI preview only: this code is generated in the browser. Real SMS delivery and server-side OTP verification are required for secure access.</p>
      </div> : <>
        <div className="wnpocket-balance-card">
          <span>Preview available balance</span>
          <strong>{formatWalletAmount(balance)}</strong>
          <small>{balance < 0 ? 'Cash-in-Hand platform fees are reflected in this local preview balance.' : 'Live wallet balances will appear after the wallet service is connected.'}</small>
        </div>
        <nav className="wnpocket-tabs" aria-label="WNPocket actions">
          {[['overview', 'Overview'], ['top-up', 'Top up'], ['withdraw', 'Withdraw'], ['cash-in-hand', 'Cash-in-Hand fees']].map(([view, label]) => <button key={view} type="button" className={activeView === view ? 'active' : ''} aria-pressed={activeView === view} onClick={() => selectView(view)}>{label}</button>)}
        </nav>
        {activeView === 'overview' && <div className="wnpocket-content">
          <section className="wnpocket-info-card"><h3>Wallet activity</h3>{activity.length === 0 ? <p className="wnpocket-empty">No wallet transactions are available yet.</p> : <div className="wnpocket-activity-list">{activity.map((transaction) => <article className="wnpocket-activity-item" key={transaction.id}><div><strong>Cash-in-Hand platform fee</strong><span>Service amount {formatWalletAmount(transaction.serviceAmount)}{transaction.customerName ? ` · ${transaction.customerName}` : ''}</span><time dateTime={transaction.createdAt}>{new Date(transaction.createdAt).toLocaleString()}</time></div><strong className="wnpocket-activity-debit">-{formatWalletAmount(transaction.feeAmount)}</strong></article>)}</div>}</section>
        </div>}
        {activeView === 'top-up' && <form className="wnpocket-form" onSubmit={startExternalPayment}>
          <h3>Top up WNPocket</h3>
          <label>Amount (INR)<input type="number" min="1" step="0.01" required value={amount} onChange={(event) => { setAmount(event.target.value); setActionMessage('') }} placeholder="Enter top-up amount" /></label>
          <label>Payment app<select value={paymentApp} onChange={(event) => setPaymentApp(event.target.value)}><option>PhonePe</option><option>Paytm</option><option>Other UPI app</option></select></label>
          <button className="primary-button" type="submit" disabled={amountValue <= 0}>Continue with {paymentApp}</button>
          {actionMessage && <p className="wnpocket-status" role="status">{actionMessage}</p>}
        </form>}
        {activeView === 'withdraw' && <form className="wnpocket-form" onSubmit={startExternalPayment}>
          <h3>Withdraw from WNPocket</h3>
          <p>Withdrawable preview balance: {formatWalletAmount(balance)}</p>
          <label>Amount (INR)<input type="number" min="1" step="0.01" required value={amount} onChange={(event) => { setAmount(event.target.value); setActionMessage('') }} placeholder="Enter withdrawal amount" /></label>
          <label>Send to<select value={paymentApp} onChange={(event) => setPaymentApp(event.target.value)}><option>PhonePe</option><option>Paytm</option><option>Other UPI app</option></select></label>
          <button className="primary-button" type="submit" disabled={amountValue <= 0 || amountValue > balance}>Continue with {paymentApp}</button>
          <p className="wnpocket-empty">Withdrawals are unavailable until a wallet balance is received.</p>
          {actionMessage && <p className="wnpocket-status" role="status">{actionMessage}</p>}
        </form>}
        {activeView === 'cash-in-hand' && <div className="wnpocket-form">
          <h3>Cash-in-Hand platform fee</h3>
          <p>When you record a completed Cash-in-Hand service, its platform fee is calculated and automatically deducted from WNPocket.</p>
          <div className="wnpocket-fee-summary"><span>Deduction timing</span><strong>At payment completion</strong></div>
          <button className="primary-button" type="button" onClick={onOpenCashInHandPayment}>Record Cash-in-Hand payment <ArrowRight size={18} /></button>
          <p className="wnpocket-preview-note">This UI preview records the fee in local wallet activity. A connected wallet service will post the real deduction.</p>
        </div>}
      </>}
    </section>
  </div>
}

export function ProviderIncomingRequestModal({ request, playSound = true, onAccept, onCancel }) {
  const [isOpen, setIsOpen] = useState(true)
  useEffect(() => {
    if (playSound) playRequestAlertTone()
  }, [playSound])
  if (!isOpen) return null
  return <div className="request-alert-backdrop" role="presentation">
    <section className="request-alert-dialog" role="alertdialog" aria-modal="true" aria-labelledby="incoming-request-title">
      <p className="eyebrow">New service request</p>
      <h2 id="incoming-request-title">A customer needs your service</h2>
      <dl className="request-alert-details">
        <div><dt>Customer Name</dt><dd>{request.customerName}</dd></div>
        <div><dt>Customer Address</dt><dd>{request.customerAddress}</dd></div>
      </dl>
      <div className="request-alert-actions">
        <button type="button" className="request-alert-cancel" onClick={() => { onCancel?.(); setIsOpen(false) }}>Cancel</button>
        <button type="button" className="request-alert-accept" onClick={() => { onAccept?.(); setIsOpen(false) }}>Accept</button>
      </div>
    </section>
  </div>
}

export function CustomerProviderAcceptedModal({ provider, onClose }) {
  const [isOpen, setIsOpen] = useState(true)
  if (!isOpen) return null
  return <div className="request-alert-backdrop" role="presentation">
    <section className="request-alert-dialog" role="dialog" aria-modal="true" aria-labelledby="provider-accepted-title">
      <button className="close-button" type="button" onClick={() => { onClose?.(); setIsOpen(false) }} aria-label="Close provider details"><X size={20} /></button>
      <p className="eyebrow">Request accepted</p>
      <h2 id="provider-accepted-title">A Service Provider has accepted your request</h2>
      <dl className="request-alert-details">
        <div><dt>Service Provider Name</dt><dd>{provider.name}</dd></div>
        <div><dt>Service Provider Address</dt><dd>{provider.address}</dd></div>
      </dl>
      <p className="request-accepted-note">The Service Provider has received your request. Service Provider: {provider.name}. The Service Provider will contact you shortly by phone.</p>
      <div className="request-alert-actions"><button type="button" className="request-alert-accept" onClick={() => { onClose?.(); setIsOpen(false) }}>Got it</button></div>
    </section>
  </div>
}

export function CustomerRequestProgress({ status, onRetry }) {
  if (status === 'exhausted') return <div className="request-progress exhausted" role="alert">
    <p>All our Service Providers are currently busy. Please try again later.</p>
    <button type="button" onClick={onRetry}>Try again</button>
  </div>
  if (status === 'contacting-next') return <div className="request-progress" role="status"><span className="request-progress-spinner" aria-hidden="true" /><p>The provider is unavailable. We’re contacting the next nearby Service Provider.</p></div>
  if (status === 'cancelled') return <div className="request-progress" role="status"><p>Your service request was cancelled.</p></div>
  return <div className="request-progress" role="status"><span className="request-progress-spinner" aria-hidden="true" /><p>Looking for the nearest available Service Provider within 20 km.</p></div>
}

export function ServiceHistoryModal({ accountType, onClose }) {
  const earliestHistoryDate = getSixMonthsAgo()
  const latestHistoryDate = toDateInputValue(new Date())
  const [historyStartDate, setHistoryStartDate] = useState(getSixMonthsAgo)
  const [historyEndDate, setHistoryEndDate] = useState(() => toDateInputValue(new Date()))
  const visibleHistory = []

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal service-history-modal" role="dialog" aria-modal="true" aria-labelledby="service-history-title">
      <button className="close-button" onClick={onClose} aria-label="Close service history"><X size={20} /></button>
      <div className="service-history-heading">
        <div><p className="eyebrow">{accountType} profile</p><h2 id="service-history-title">Service History</h2></div>
        <span className="service-history-summary"><span>{visibleHistory.length} records</span><CalendarDays size={16} /></span>
      </div>
      <p className="modal-intro">Review completed services associated with your profile.</p>
      <div className="service-history-content">
        <div className="service-history-dates">
          <label>Start date<input type="date" value={historyStartDate} min={earliestHistoryDate} max={historyEndDate || latestHistoryDate} onChange={(event) => setHistoryStartDate(event.target.value)} /></label>
          <label>End date<input type="date" value={historyEndDate} min={historyStartDate || earliestHistoryDate} max={latestHistoryDate} onChange={(event) => setHistoryEndDate(event.target.value)} /></label>
        </div>
        {visibleHistory.length ? <ul className="service-history-list">
          {visibleHistory.map((record) => <li key={record.id}>
            <div><strong>{record.service}</strong><span>{record.customer}</span><small>Completed · INR {record.amount.toLocaleString('en-IN')}</small></div>
            <time dateTime={record.date}>{formatServiceDate(record.date)}</time>
          </li>)}
        </ul> : <p className="service-history-empty">No service history for these dates.</p>}
      </div>
    </section>
  </div>
}

export function ResignationConfirmationModal({ accountType, submitted, error, onConfirm, onClose }) {
  return <div className="admin-confirm-backdrop" role="presentation">
    <section className="admin-confirm-dialog resignation-dialog" role={submitted ? 'dialog' : 'alertdialog'} aria-modal="true" aria-labelledby="resignation-dialog-title">
      {submitted ? <>
        <p className="eyebrow">Request submitted</p>
        <h3 id="resignation-dialog-title">Resignation request submitted</h3>
        <p>Your request has been saved for review.</p>
        <div className="admin-confirm-actions"><button className="table-action approve" type="button" onClick={onClose}>Close</button></div>
      </> : <>
        <p className="eyebrow">Confirm request</p>
        <h3 id="resignation-dialog-title">Submit resignation request?</h3>
        <p>This will submit a resignation request for your {accountType} profile.</p>
        {error && <p className="resignation-error" role="alert">{error}</p>}
        <div className="admin-confirm-actions">
          <button className="table-action approve" type="button" onClick={onConfirm}>Confirm</button>
          <button className="table-action" type="button" onClick={onClose}>Cancel</button>
        </div>
      </>}
    </section>
  </div>
}

export function CloseAccountConfirmationModal({ error, onConfirm, onClose }) {
  return <div className="admin-confirm-backdrop" role="presentation">
    <section className="admin-confirm-dialog close-account-dialog" role="alertdialog" aria-modal="true" aria-labelledby="close-account-dialog-title">
      <p className="eyebrow">Permanent action</p>
      <h3 id="close-account-dialog-title">Close your account?</h3>
      <p>This permanently closes your account and removes its saved profile. You will be signed out.</p>
      {error && <p className="resignation-error" role="alert">{error}</p>}
      <div className="admin-confirm-actions">
        <button className="table-action block" type="button" onClick={onConfirm}>Confirm</button>
        <button className="table-action" type="button" onClick={onClose}>Cancel</button>
      </div>
    </section>
  </div>
}

export function ProfileRequestActions({ role, serviceAmount, onServiceAmountChange, serviceOfferStatus, onServiceOfferStatusChange }) {
  const isProvider = role === 'Service Provider'
  const [decision, setDecision] = useState('')
  const hasServiceAmount = Number(serviceAmount) > 0
  const formattedServiceAmount = hasServiceAmount ? Number(serviceAmount).toLocaleString('en-IN') : ''
  const customerCanReviewOffer = serviceOfferStatus === 'approved' && hasServiceAmount
  const customerPrompt = customerCanReviewOffer
    ? 'Review the service provider amount and choose Approve or Reject.'
    : serviceOfferStatus === 'rejected'
      ? 'The service provider rejected this request.'
      : 'Waiting for the service provider to approve an amount.'
  const providerPrompt = serviceOfferStatus === 'approved'
    ? 'You approved this amount. It is now visible to the customer.'
    : serviceOfferStatus === 'rejected'
      ? 'You rejected this service request.'
      : 'Enter an amount and approve it to send it to the customer.'
  const decisionPrompt = decision === 'approved'
    ? 'You approved this service amount.'
    : decision === 'cancelled'
      ? 'You cancelled this service.'
      : 'You rejected this service amount.'
  const providerDisabledReason = 'No service request is currently assigned to this service provider.'
  const message = isProvider ? providerPrompt : decision ? decisionPrompt : customerPrompt

  return <section className="profile-request-actions" aria-label={`${role} service request actions`}>
    <div className="profile-request-heading">
      <strong>{isProvider ? 'Service Request' : 'Service Offer'}</strong>
      <span>{isProvider ? 'Service Provider action' : 'Customer decision'}</span>
    </div>
    <p>{message}</p>
    <div className={isProvider ? 'profile-request-buttons provider' : 'profile-request-buttons'}>
      {isProvider ? <>
        <button type="button" className="profile-request-accept" disabled title={providerDisabledReason}>Accepted Service List</button>
        <button type="button" className="profile-request-call" disabled title={providerDisabledReason}>Call with Customer</button>
      </> : <>
        <button type="button" disabled={!customerCanReviewOffer || Boolean(decision)} onClick={() => setDecision('approved')}>Approve</button>
        <button type="button" className="reject" disabled={!customerCanReviewOffer || Boolean(decision)} onClick={() => setDecision('rejected')}>Reject</button>
      </>}
    </div>
    <label className="profile-request-amount">
      <span>Service Amount (INR)</span>
      {isProvider
        ? <input type="number" min="0" step="1" inputMode="decimal" value={serviceAmount} onChange={(event) => { onServiceAmountChange(event.target.value); onServiceOfferStatusChange('pending'); setDecision('') }} placeholder="Enter agreed amount" />
        : <input type="text" value={customerCanReviewOffer ? formattedServiceAmount : ''} readOnly placeholder={serviceOfferStatus === 'rejected' ? 'Service provider rejected this request' : 'Awaiting provider approval'} aria-label="Service Amount (INR), read only" />}
    </label>
    {isProvider && <div className="profile-request-buttons provider">
      <button type="button" disabled={!hasServiceAmount || serviceOfferStatus !== 'pending'} onClick={() => onServiceOfferStatusChange('approved')}>Service Amount</button>
      <button type="button" className="reject" disabled={!hasServiceAmount || serviceOfferStatus !== 'pending'} onClick={() => onServiceOfferStatusChange('rejected')}>Reject New Service</button>
    </div>}
    {!isProvider && <button type="button" className="profile-request-cancel" disabled={Boolean(decision)} onClick={() => setDecision('cancelled')}>Cancel Service</button>}
  </section>
}
