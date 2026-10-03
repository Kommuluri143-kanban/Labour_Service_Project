export const registeredProfilesKey = 'worknear.registeredProfiles'
export const activeProfileKey = 'worknear.activeProfile'
export const resignationRequestsKey = 'worknear.resignationRequests'

export function normalizeMobileNumber(mobile) {
  const digits = String(mobile || '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

export function readRegisteredProfiles() {
  try {
    const profiles = JSON.parse(window.localStorage.getItem(registeredProfilesKey) || '[]')
    return Array.isArray(profiles) ? profiles : []
  } catch {
    return []
  }
}

export function readResignationRequests() {
  try {
    const requests = JSON.parse(window.localStorage.getItem(resignationRequestsKey) || '[]')
    return Array.isArray(requests) ? requests : []
  } catch {
    return []
  }
}

export function readEmployerProfiles() {
  const resignationRequests = readResignationRequests().filter((request) => request?.accountType === 'Employer')
  return readRegisteredProfiles()
    .filter((profile) => profile?.profileType === 'Employer')
    .map((profile) => {
      const profileMobile = normalizeMobileNumber(profile?.mobile)
      const profileName = String(profile?.fullName || profile?.name || '').trim().toLocaleLowerCase()
      const hasResigned = resignationRequests.some((request) => {
        const requestMobile = normalizeMobileNumber(request?.mobile)
        if (profileMobile && requestMobile) return profileMobile === requestMobile
        return profileName && profileName === String(request?.fullName || '').trim().toLocaleLowerCase()
      })
      return {
        id: profileMobile || profileName || `${profile?.profileType}-${profile?.division || ''}-${profile?.mandal || ''}`,
        name: profile?.fullName || profile?.name || 'Employer',
        mobile: profile?.mobile || '',
        address: profile?.address || [profile?.village, profile?.mandal, profile?.division].filter(Boolean).join(', ') || 'Not provided yet',
        status: profile?.status === 'Resigned' || hasResigned ? 'Resigned' : 'Active',
      }
    })
}

export function readActiveProfile() {
  try {
    return JSON.parse(window.localStorage.getItem(activeProfileKey) || 'null')
  } catch {
    return null
  }
}

