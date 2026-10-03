import { useState } from 'react'
import { ArrowLeft, Phone, X } from 'lucide-react'
import { RoutePage } from '../../components/RoutePage.jsx'
import { readAcceptedServiceRequests, removeAcceptedServiceRequest, updateAcceptedServiceRequestAmount, updateAcceptedServiceRequestStatus } from '../../data/acceptedServiceStore.js'
import './AcceptedServicesPage.css'

const statusOptions = ['Accepted', 'In Progress', 'Completed']

function getPhoneHref(mobile) {
  const value = String(mobile || '').trim()
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 10) return `tel:+91${digits}`
  if (value.startsWith('+')) return `tel:+${digits}`
  return `tel:${digits}`
}

export function AcceptedServicesPage({ profile, onBack }) {
  const [requests, setRequests] = useState(() => readAcceptedServiceRequests(profile))
  const [amounts, setAmounts] = useState(() => Object.fromEntries(readAcceptedServiceRequests(profile).map((request) => [request.id, request.serviceAmount ?? ''])))
  const [savedAmountIds, setSavedAmountIds] = useState([])
  const [error, setError] = useState('')

  const handleStatusChange = (requestId, status) => {
    const updatedRequests = updateAcceptedServiceRequestStatus(profile, requestId, status)
    if (!updatedRequests) {
      setError('Unable to save this status change. Please try again.')
      return
    }
    setRequests(updatedRequests)
    setError('')
  }

  const handleAmountSubmit = (event, requestId) => {
    event.preventDefault()
    const updatedRequests = updateAcceptedServiceRequestAmount(profile, requestId, amounts[requestId])
    if (!updatedRequests) {
      setError('Enter a service amount greater than ₹0 and try again.')
      return
    }
    setRequests(updatedRequests)
    setSavedAmountIds((current) => current.includes(requestId) ? current : [...current, requestId])
    setError('')
  }

  const handleCancel = (requestId) => {
    const updatedRequests = removeAcceptedServiceRequest(profile, requestId)
    if (!updatedRequests) {
      setError('Unable to cancel this service. Please try again.')
      return
    }
    setRequests(updatedRequests)
    setAmounts((current) => {
      const next = { ...current }
      delete next[requestId]
      return next
    })
    setSavedAmountIds((current) => current.filter((id) => id !== requestId))
    setError('')
  }

  return <RoutePage name="accepted-services">
    <section className="accepted-services-page" aria-labelledby="accepted-services-title">
      <button className="accepted-services-back" type="button" onClick={onBack}><ArrowLeft size={16} /> Back to profile</button>
      <header className="accepted-services-heading">
        <p className="eyebrow">Service Provider Profile</p>
        <h1 id="accepted-services-title">Accepted Services List</h1>
        <p>Review accepted customer requests and update each service as work progresses.</p>
      </header>
      {error && <p className="accepted-services-error" role="alert">{error}</p>}
      <div className="accepted-services-table-wrap">
        <table className="accepted-services-table">
          <thead><tr><th scope="col">ID</th><th scope="col">Customer Name</th><th scope="col">Address</th><th scope="col">Contact</th><th scope="col">Service Amount</th><th scope="col">Status</th><th scope="col">Cancel Service</th></tr></thead>
          <tbody>{requests.length ? requests.map((request, index) => {
            const callHref = getPhoneHref(request.customerMobile)
            return <tr key={request.id}>
              <td className="accepted-services-id">{index + 1}</td>
              <td><strong>{request.customerName}</strong></td>
              <td className="accepted-services-address">{request.customerAddress}</td>
              <td>{callHref ? <div className="accepted-services-call-cell"><a className="accepted-services-call" href={callHref} aria-label={`Call ${request.customerName} at ${request.customerMobile}`}><Phone size={15} aria-hidden="true" /> Call</a><small>{request.customerMobile}</small></div> : <span className="accepted-services-no-phone">Mobile unavailable</span>}</td>
              <td>
                <form className="accepted-services-amount-form" onSubmit={(event) => handleAmountSubmit(event, request.id)}>
                  <label className="accepted-services-amount-field">
                    <span className="accepted-services-currency">₹</span>
                    <input type="number" min="1" step="1" inputMode="decimal" required value={amounts[request.id] ?? ''} onChange={(event) => { setAmounts((current) => ({ ...current, [request.id]: event.target.value })); setSavedAmountIds((current) => current.filter((id) => id !== request.id)) }} aria-label={`Service amount for ${request.customerName}`} />
                  </label>
                  <button className="accepted-services-submit" type="submit">Submit</button>
                  {savedAmountIds.includes(request.id) && <span className="accepted-services-saved" role="status">Saved</span>}
                </form>
              </td>
              <td><select className="accepted-services-status" aria-label={`Status for ${request.customerName}`} value={statusOptions.includes(request.status) ? request.status : 'Accepted'} onChange={(event) => handleStatusChange(request.id, event.target.value)}>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></td>
              <td><button className="accepted-services-cancel" type="button" onClick={() => handleCancel(request.id)} aria-label={`Cancel service for ${request.customerName}`}><X size={15} aria-hidden="true" /> Cancel</button></td>
            </tr>
          }) : <tr><td className="accepted-services-empty" colSpan="7">No accepted service requests yet.</td></tr>}</tbody>
        </table>
      </div>
    </section>
  </RoutePage>
}
