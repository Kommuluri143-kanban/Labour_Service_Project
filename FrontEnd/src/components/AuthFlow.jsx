import { useState } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { divisions, mandalVillages, mandals, divisionMandals } from '../data/locationData.js'

export function AuthFlow({ mode, onBack, onSuccess }) {
  const [fullName, setFullName] = useState('')
  const [selectedDivision, setSelectedDivision] = useState('')
  const [selectedMandal, setSelectedMandal] = useState('')
  const [selectedVillage, setSelectedVillage] = useState('')
  const [selectedProfileType, setSelectedProfileType] = useState('Customer')
  const [mobile, setMobile] = useState('')
  const [signupStep, setSignupStep] = useState('profile')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const availableMandals = divisionMandals[selectedDivision] || mandals
  const availableVillages = mandalVillages[selectedMandal] || []
  const isAdminEmployerSignup = mode === 'signup' && signupStep !== 'profile'
  const isAdminEmployerVerification = isAdminEmployerSignup && signupStep === 'verification'

  const handleSubmit = (event) => {
    event.preventDefault()
    if (mode === 'signup' && signupStep === 'credentials') {
      const passwordIsValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,16}$/.test(adminPassword)
      if (!passwordIsValid) {
        setPasswordError('Use 8–16 characters with at least one letter, one number, and one special character.')
        return
      }
      setPasswordError('')
      setGeneratedOtp(String(Math.floor(100000 + Math.random() * 900000)))
      setOtp('')
      setOtpError('')
      setSignupStep('verification')
      return
    }
    if (isAdminEmployerVerification) {
      if (otp !== generatedOtp) {
        setOtpError('The OTP does not match. Enter the development OTP shown above.')
        return
      }
      onSuccess({
        mode,
        profile: { fullName, mobile, division: selectedDivision, mandal: selectedMandal, village: selectedVillage, profileType: selectedProfileType, email: adminEmail },
      })
      return
    }
    if (!generatedOtp) {
      const nextOtp = String(Math.floor(100000 + Math.random() * 900000))
      setGeneratedOtp(nextOtp)
      setOtp('')
      return
    }
    if (otp !== generatedOtp) {
      setOtpError('Enter the demo OTP shown above.')
      return
    }
    onSuccess({
      mode,
      profile: {
        fullName,
        mobile,
        division: selectedDivision,
        mandal: selectedMandal,
        village: selectedVillage,
        profileType: mode === 'signup' ? selectedProfileType : undefined,
      },
    })
  }

  const handleBack = () => {
    if (mode === 'signup' && signupStep === 'verification') {
      setSignupStep('credentials')
      setGeneratedOtp('')
      setOtp('')
      setOtpError('')
      return
    }
    if (mode === 'signup' && signupStep === 'credentials') {
      setSignupStep('profile')
      setPasswordError('')
      return
    }
    if (generatedOtp) {
      setGeneratedOtp('')
      setOtp('')
      setOtpError('')
      return
    }
    onBack()
  }

  return <section className="signin-screen">
    <section className="signin-panel">
      <h1>{isAdminEmployerVerification ? 'OTP Verification' : signupStep === 'credentials' ? 'Sign up' : generatedOtp ? 'Verify OTP' : mode === 'signup' ? 'Sign up' : 'Sign in'}</h1>
      <p className="signin-intro">{isAdminEmployerVerification ? `Development OTP for ${adminEmail}: ${generatedOtp}` : signupStep === 'credentials' ? 'Create an Admin or Employer account with your email address and password.' : generatedOtp ? `Development OTP for ${mobile || 'this test session'}: ${generatedOtp}` : 'Choose a service to continue to the local work board.'}</p>
      <form onSubmit={handleSubmit}>
        {signupStep === 'credentials' ? <>
          <label>Email Address<input type="email" autoComplete="email" required value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="Enter your email address" /></label>
          <label>Password<input type="password" autoComplete="new-password" required minLength={8} maxLength={16} value={adminPassword} onChange={(event) => { setAdminPassword(event.target.value); setPasswordError('') }} placeholder="Create a password" /><small className="password-requirements">8–16 characters, including a letter, a number, and a special character.</small>{passwordError && <small className="otp-error">{passwordError}</small>}</label>
        </> : !generatedOtp && <>
          {mode === 'signup' && <>
            <label>Full Name<input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Enter your full name" /></label>
          </>}
          <label>Mobile Number<input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="Enter mobile number" /></label>
          {mode === 'signup' && <>
            <label>Division<select value={selectedDivision} onChange={(event) => { setSelectedDivision(event.target.value); setSelectedMandal(''); setSelectedVillage('') }}><option value="">Select a division</option>{divisions.map((division) => <option key={division} value={division}>{division}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
            <label>Mandal<select value={selectedMandal} onChange={(event) => { setSelectedMandal(event.target.value); setSelectedVillage('') }}><option value="">Select a mandal</option>{availableMandals.map((mandal) => <option key={mandal} value={mandal}>{mandal}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
            <label>Village / Locality<select value={selectedVillage} disabled={!selectedMandal || availableVillages.length === 0} onChange={(event) => setSelectedVillage(event.target.value)}><option value="">{selectedMandal && availableVillages.length === 0 ? 'No village options available' : 'Select a village / locality'}</option>{availableVillages.map((village) => <option key={village} value={village}>{village}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
            <label>Profile Type<select value={selectedProfileType} onChange={(event) => setSelectedProfileType(event.target.value)}><option>Customer</option><option>Service Provider</option><option>Admin</option><option>Employer</option></select><ChevronDown className="select-icon" size={16} /></label>
          </>}
        </>}
        {generatedOtp && <label>{isAdminEmployerVerification ? 'One-time password' : 'One-time password'}<input autoFocus type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, '')); setOtpError('') }} placeholder="Enter 6-digit OTP" />{otpError && <small className="otp-error">{otpError}</small>}</label>}
        <button className="primary-button form-submit" type="submit" disabled={mode === 'signup' && signupStep === 'profile' && !generatedOtp && ['Admin', 'Employer'].includes(selectedProfileType)}>{generatedOtp ? 'Verify OTP' : 'Continue to OTP'} <ArrowRight size={18} /></button>
        <div className="signin-footer-actions">
          <button className="signin-back" type="button" onClick={handleBack}>← Back</button>
          {mode === 'signup' && signupStep === 'profile' && !generatedOtp && <button className="admin-employer-signup" type="button" disabled={!['Admin', 'Employer'].includes(selectedProfileType)} onClick={() => setSignupStep('credentials')}>Admin or Employer Sign up →</button>}
        </div>
      </form>
    </section>
  </section>
}
