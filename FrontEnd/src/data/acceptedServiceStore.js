import { normalizeMobileNumber } from './profileStore.js'

export const acceptedServiceRequestsKey = 'worknear.acceptedServiceRequests'

const acceptedStatuses = ['Accepted', 'In Progress', 'Completed']

function getProviderKey(profile = {}) {
  const mobile = normalizeMobileNumber(profile?.mobile)
  if (mobile) return `mobile:${mobile}`
  const email = String(profile?.email || profile?.username || '').trim().toLocaleLowerCase()
  return email ? `email:${email}` : ''
}

function readAllAcceptedServiceRequests() {
  try {
    const requests = JSON.parse(window.localStorage.getItem(acceptedServiceRequestsKey) || '[]')
    return Array.isArray(requests) ? requests : []
  } catch {
    return []
  }
}

export function readAcceptedServiceRequests(profile) {
  const providerKey = getProviderKey(profile)
  if (!providerKey) return []
  return readAllAcceptedServiceRequests().filter((request) => request?.providerKey === providerKey)
}

export function addAcceptedServiceRequest(profile, request = {}) {
  const providerKey = getProviderKey(profile)
  if (!providerKey) return false
  const customer = request?.customer || request?.customerProfile || {}

  const acceptedRequest = {
    id: String(request?.id || `accepted-${Date.now()}`),
    providerKey,
    customerName: String(request?.customerName || request?.name || customer.fullName || 'Customer'),
    customerAddress: String(request?.customerAddress || request?.address || customer.address || 'Address not provided'),
    customerMobile: String(request?.customerMobile || request?.registeredMobile || request?.mobile || customer.mobile || ''),
    serviceAmount: Number(request?.serviceAmount ?? request?.amount) > 0 ? Number(request?.serviceAmount ?? request?.amount) : '',
    status: 'Accepted',
    acceptedAt: request?.acceptedAt || new Date().toISOString(),
  }
  const requests = readAllAcceptedServiceRequests().filter((existing) => !(existing.providerKey === providerKey && existing.id === acceptedRequest.id))

  try {
    window.localStorage.setItem(acceptedServiceRequestsKey, JSON.stringify([...requests, acceptedRequest]))
    return true
  } catch {
    return false
  }
}

export function updateAcceptedServiceRequestStatus(profile, requestId, status) {
  const providerKey = getProviderKey(profile)
  if (!providerKey || !acceptedStatuses.includes(status)) return null

  let didUpdate = false
  const requests = readAllAcceptedServiceRequests().map((request) => {
    if (!request || request.providerKey !== providerKey || request.id !== requestId) return request
    didUpdate = true
    return { ...request, status }
  })
  if (!didUpdate) return null

  try {
    window.localStorage.setItem(acceptedServiceRequestsKey, JSON.stringify(requests))
    return requests.filter((request) => request?.providerKey === providerKey)
  } catch {
    return null
  }
}

export function updateAcceptedServiceRequestAmount(profile, requestId, amount) {
  const providerKey = getProviderKey(profile)
  const serviceAmount = Number(amount)
  if (!providerKey || !Number.isFinite(serviceAmount) || serviceAmount <= 0) return null

  let didUpdate = false
  const requests = readAllAcceptedServiceRequests().map((request) => {
    if (!request || request.providerKey !== providerKey || request.id !== requestId) return request
    didUpdate = true
    return { ...request, serviceAmount }
  })
  if (!didUpdate) return null

  try {
    window.localStorage.setItem(acceptedServiceRequestsKey, JSON.stringify(requests))
    return requests.filter((request) => request?.providerKey === providerKey)
  } catch {
    return null
  }
}

export function removeAcceptedServiceRequest(profile, requestId) {
  const providerKey = getProviderKey(profile)
  if (!providerKey) return null

  const requests = readAllAcceptedServiceRequests()
  const updatedRequests = requests.filter((request) => !(request?.providerKey === providerKey && request.id === requestId))
  if (updatedRequests.length === requests.length) return null

  try {
    window.localStorage.setItem(acceptedServiceRequestsKey, JSON.stringify(updatedRequests))
    return updatedRequests.filter((request) => request?.providerKey === providerKey)
  } catch {
    return null
  }
}
