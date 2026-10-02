import { useEffect, useState } from 'react'
import { ArrowLeft, Pencil } from 'lucide-react'
import { labourTypes } from '../../data/serviceData.js'
import { normalizeMobileNumber, readRegisteredProfiles, readEmployerProfiles } from '../../data/profileStore.js'
import { getAppCommissionRate } from '../../utils/finance.js'

export function parseAdminApprovalDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed

  const localized = String(value).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (!localized) return null

  const [, day, month, year, hour, minute, second = '0', period] = localized
  let hours = Number(hour)
  if (period?.toLowerCase() === 'pm' && hours < 12) hours += 12
  if (period?.toLowerCase() === 'am' && hours === 12) hours = 0
  const date = new Date(Number(year), Number(month) - 1, Number(day), hours, Number(minute), Number(second))
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatAdminApprovalDateTime(value) {
  if (!value) return '—'
  const date = parseAdminApprovalDate(value)
  if (!date) return String(value)
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  }).formatToParts(date)
  const formatted = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]))
  return `${formatted.day} ${formatted.month} ${formatted.year}, ${formatted.hour}:${formatted.minute} ${formatted.dayPeriod.toUpperCase()}`
}

export function formatAdminDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getAdminPaymentDateBounds(today = new Date()) {
  const monthStart = new Date(today.getFullYear(), today.getMonth() - 6, 1)
  const lastDayOfTargetMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
  const sixMonthsAgo = new Date(monthStart.getFullYear(), monthStart.getMonth(), Math.min(today.getDate(), lastDayOfTargetMonth))
  return { minDate: formatAdminDateInputValue(sixMonthsAgo), maxDate: formatAdminDateInputValue(today) }
}

export function sortAdminTableRows(rows, columns, sort) {
  const column = columns.find(({ key }) => key === sort.key)
  if (!column) return rows
  return [...rows].sort((left, right) => {
    const leftValue = column.value(left) ?? ''
    const rightValue = column.value(right) ?? ''
    let comparison
    if (column.sortType === 'date') {
      const leftDate = parseAdminApprovalDate(leftValue)
      const rightDate = parseAdminApprovalDate(rightValue)
      if (!leftDate || !rightDate) return !leftDate && !rightDate ? 0 : !leftDate ? 1 : -1
      comparison = leftDate.getTime() - rightDate.getTime()
    } else if (column.sortType === 'number') {
      comparison = Number(leftValue) - Number(rightValue)
    } else {
      comparison = String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true, sensitivity: 'base' })
    }
    return sort.direction === 'asc' ? comparison : -comparison
  })
}

export function filterAdminProviderRows(rows, searchValue) {
  const search = searchValue.trim().toLocaleLowerCase()
  if (!search) return rows
  const mobileSearch = search.replace(/\D/g, '')
  return rows.filter((provider) => {
    const name = String(provider.name || '').toLocaleLowerCase()
    const mobile = String(provider.mobile || '').toLocaleLowerCase()
    const mobileDigits = mobile.replace(/\D/g, '')
    return name.includes(search) || mobile.includes(search) || Boolean(mobileSearch && mobileDigits.includes(mobileSearch))
  })
}

export function SortableTableHeader({ columns, sort, onSort }) {
  return <thead><tr>{columns.map(({ key, label }) => {
    const isSorted = sort.key === key
    const direction = sort.direction
    return <th key={key} scope="col" aria-sort={isSorted ? direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
      <button className="admin-sort-button" type="button" onClick={() => onSort(key)} title={`Sort ${label} ${isSorted && direction === 'asc' ? 'descending' : 'ascending'}`}>
        <span>{label}</span><span aria-hidden="true">{isSorted ? direction === 'asc' ? '↑' : '↓' : '↕'}</span>
      </button>
    </th>
  })}</tr></thead>
}

export function AdminDashboard({ initialView = 'providers', onViewChange, onHome }) {
  const employers = readEmployerProfiles()
  const customers = readRegisteredProfiles()
    .filter((profile) => profile?.profileType === 'Customer')
    .map((profile, index) => ({
      id: normalizeMobileNumber(profile.mobile) || `${profile.fullName || 'customer'}-${index}`,
      name: profile.fullName || 'Customer',
      mobile: profile.mobile || '',
      address: profile.address || [profile.village, profile.mandal, profile.division].filter(Boolean).join(', ') || 'Not provided yet',
    }))
  const [adminView, setAdminView] = useState(initialView)
  const [activeProviderSort, setActiveProviderSort] = useState({ key: 'name', direction: 'asc' })
  const [accessProviderSort, setAccessProviderSort] = useState({ key: 'name', direction: 'asc' })
  const [pendingProviderSort, setPendingProviderSort] = useState({ key: 'name', direction: 'asc' })
  const [activeProviderSearch, setActiveProviderSearch] = useState('')
  const [accessProviderSearch, setAccessProviderSearch] = useState('')
  const [pendingProviderSearch, setPendingProviderSearch] = useState('')
  const [providers, setProviders] = useState([])
  const [pendingProviders, setPendingProviders] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingAccessId, setEditingAccessId] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const adminDetails = { name: 'Admin', mobile: '' }
  const activeProviderCount = providers.filter((provider) => provider.status === 'Active' && !provider.blocked).length
  const inactiveProviderCount = providers.filter((provider) => provider.status !== 'Active').length + pendingProviders.filter((provider) => provider.status === 'Inactive').length
  const blockedProviderCount = providers.filter((provider) => provider.blocked).length

  const activeProviderColumns = [
    { key: 'name', label: 'Service Provider Name', value: (provider) => provider.name || '', render: (provider) => <strong>{provider.name}</strong> },
    { key: 'mobile', label: 'Mobile Number', value: (provider) => provider.mobile || '', render: (provider) => provider.mobile },
    { key: 'address', label: 'Address', value: (provider) => provider.address || '', render: (provider) => provider.address },
    { key: 'service', label: 'Services Knows', value: (provider) => provider.service || 'Service Provider', render: (provider) => provider.service || 'Service Provider' },
    { key: 'status', label: 'Profile Status', value: (provider) => provider.status || '', render: (provider) => <span className="table-status complete">{provider.status}</span> },
    { key: 'adminName', label: 'Approved Admin Name', value: (provider) => provider.approval?.admin || provider.accessAdmin?.name || '—', render: (provider) => provider.approval?.admin || provider.accessAdmin?.name || '—' },
    { key: 'adminMobile', label: 'Admin Mobile Number', value: (provider) => provider.approval?.mobile || provider.accessAdmin?.mobile || '—', render: (provider) => provider.approval?.mobile || provider.accessAdmin?.mobile || '—' },
    { key: 'approvedAt', label: 'Approved Date & Time', value: (provider) => provider.approval?.date || '', sortType: 'date', render: (provider) => formatAdminApprovalDateTime(provider.approval?.date) },
  ]
  const sortedActiveProviders = sortAdminTableRows(filterAdminProviderRows(providers, activeProviderSearch), activeProviderColumns, activeProviderSort)
  const sortActiveProvidersBy = (key) => setActiveProviderSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }))

  useEffect(() => {
    setAdminView(initialView)
  }, [initialView])

  const changeAdminView = (view) => {
    setAdminView(view)
    onViewChange?.(view)
  }

  const updateProvider = (id, field, value) => {
    setPendingProviders((current) => current.map((provider) => provider.id === id ? { ...provider, [field]: value } : provider))
  }

  const approveProvider = (provider) => {
    const approval = { admin: adminDetails.name, date: new Date().toISOString() }
    setPendingProviders((current) => current.filter((item) => item.id !== provider.id))
    setProviders((current) => [...current, { ...provider, status: 'Active', approved: true, approval, blocked: false, accessAdmin: null }])
  }

  const updateAccessProvider = (id, field, value) => {
    setProviders((current) => current.map((provider) => provider.id === id ? { ...provider, [field]: value } : provider))
  }

  const toggleProviderAccess = (provider) => {
    updateAccessProvider(provider.id, 'blocked', !provider.blocked)
    updateAccessProvider(provider.id, 'accessAdmin', { name: adminDetails.name, mobile: adminDetails.mobile, date: new Date().toISOString() })
  }

  const requestConfirmation = (action, provider, onConfirm) => setConfirmation({ action, provider, onConfirm })

  const accessProviderColumns = [
    { key: 'name', label: 'Service Provider Name', value: (provider) => provider.name || '', render: (provider) => <strong>{provider.name}</strong> },
    { key: 'mobile', label: 'Mobile Number', value: (provider) => provider.mobile || '', render: (provider) => provider.mobile },
    { key: 'address', label: 'Address', value: (provider) => provider.address || '', render: (provider) => provider.address },
    { key: 'service', label: 'Services Knows', value: (provider) => provider.service || 'Service Provider', render: (provider) => provider.service || 'Service Provider' },
    { key: 'status', label: 'Profile Status', value: (provider) => provider.blocked ? 'Blocked' : provider.status || '', render: (provider) => <span className={provider.blocked ? 'table-status blocked' : 'table-status complete'}>{provider.blocked ? 'Blocked' : provider.status}</span> },
    { key: 'accessAction', label: 'Block / Unblock', value: (provider) => provider.blocked ? 'Unblock' : 'Block', render: (provider) => <button className={provider.blocked ? 'table-action approve' : 'table-action block'} onClick={() => requestConfirmation(provider.blocked ? 'Unblock' : 'Block', provider, () => toggleProviderAccess(provider))}>{provider.blocked ? 'Unblock' : 'Block'}</button> },
    { key: 'comment', label: 'Comment', value: (provider) => provider.comment || '', render: (provider) => editingAccessId === provider.id ? <input value={provider.comment} onChange={(event) => updateAccessProvider(provider.id, 'comment', event.target.value)} aria-label={`Comment for ${provider.name}`} /> : provider.comment },
    { key: 'edit', label: 'Edit', value: (provider) => provider.name || '', render: (provider) => editingAccessId === provider.id ? <button className="table-action" onClick={() => setEditingAccessId(null)}>Save</button> : <button className="table-icon-action" onClick={() => setEditingAccessId(provider.id)} title="Edit provider comment" aria-label={`Edit ${provider.name}`}><Pencil size={14} /></button> },
    { key: 'adminName', label: 'Admin Name', value: (provider) => provider.accessAdmin?.name || 'Pending', render: (provider) => provider.accessAdmin?.name || 'Pending' },
    { key: 'adminMobile', label: 'Admin Mobile Number', value: (provider) => provider.accessAdmin?.mobile || 'Pending', render: (provider) => provider.accessAdmin?.mobile || 'Pending' },
    { key: 'accessAt', label: 'Blocked & Unblocked Date & Time', value: (provider) => provider.accessAdmin?.date || '', sortType: 'date', render: (provider) => formatAdminApprovalDateTime(provider.accessAdmin?.date) },
  ]
  const sortedAccessProviders = sortAdminTableRows(filterAdminProviderRows(providers, accessProviderSearch), accessProviderColumns, accessProviderSort)
  const sortAccessProvidersBy = (key) => setAccessProviderSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }))

  const pendingProviderColumns = [
    { key: 'name', label: 'Service Provider Name', value: (provider) => provider.name || '', render: (provider) => editingId === provider.id ? <input value={provider.name} onChange={(event) => updateProvider(provider.id, 'name', event.target.value)} /> : <strong>{provider.name}</strong> },
    { key: 'mobile', label: 'Mobile Number', value: (provider) => provider.mobile || '', render: (provider) => editingId === provider.id ? <input value={provider.mobile} onChange={(event) => updateProvider(provider.id, 'mobile', event.target.value)} /> : provider.mobile },
    { key: 'address', label: 'Address', value: (provider) => provider.address || '', render: (provider) => editingId === provider.id ? <input value={provider.address} onChange={(event) => updateProvider(provider.id, 'address', event.target.value)} /> : provider.address },
    { key: 'service', label: 'Services Knows', value: (provider) => provider.service || '', render: (provider) => editingId === provider.id ? <select value={provider.service} onChange={(event) => updateProvider(provider.id, 'service', event.target.value)}>{labourTypes.map((service) => <option key={service}>{service}</option>)}</select> : provider.service },
    { key: 'workPhoto', label: 'Work Images', value: (provider) => provider.workPhoto || '', render: (provider) => <img className="work-photo" src={provider.workPhoto} alt={`${provider.name} completed work`} /> },
    { key: 'status', label: 'Profile Status', value: (provider) => provider.status || '', render: (provider) => <span className="table-status progress">{provider.status}</span> },
    { key: 'adminAction', label: 'Admin Action', value: (provider) => provider.name || '', render: (provider) => <div className="approval-actions">{editingId === provider.id ? <button className="table-action" onClick={() => setEditingId(null)}>Save</button> : <button className="table-icon-action" onClick={() => setEditingId(provider.id)} title="Edit provider" aria-label={`Edit ${provider.name}`}><Pencil size={14} /></button>}<button className="table-action approve" onClick={() => requestConfirmation('Approve', provider, () => approveProvider(provider))}>Approve</button></div> },
    { key: 'adminName', label: 'Admin Name', value: (provider) => provider.approval?.admin || 'Pending', render: (provider) => provider.approval?.admin || 'Pending' },
    { key: 'adminMobile', label: 'Admin Mobile Number', value: (provider) => provider.approval?.mobile || 'Pending', render: (provider) => provider.approval?.mobile || 'Pending' },
    { key: 'requestDate', label: 'Approval Request Date & Time', value: (provider) => provider.requestDate || '', sortType: 'date', render: (provider) => formatAdminApprovalDateTime(provider.requestDate) },
  ]
  const sortedPendingProviders = sortAdminTableRows(filterAdminProviderRows(pendingProviders, pendingProviderSearch), pendingProviderColumns, pendingProviderSort)
  const sortPendingProvidersBy = (key) => setPendingProviderSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }))

  return <div className="admin-dashboard-content">
    <div className="admin-dashboard-header"><div><h3>{adminView === 'payments' ? 'Payment Status' : adminView === 'employers' ? 'Employers' : adminView === 'service-providers' ? 'Customers' : 'Service Providers Management'}</h3></div><div className="admin-dashboard-actions"><button className="admin-dashboard-link" type="button" onClick={() => adminView === 'providers' ? onHome?.() : changeAdminView('providers')} aria-label={adminView === 'providers' ? 'Back to home' : 'Back to Service Providers Management'}><ArrowLeft size={14} /> Back</button><button className="admin-dashboard-link" type="button" onClick={() => changeAdminView('payments')}>Payment Status</button><button className="admin-dashboard-link" type="button" onClick={() => changeAdminView('employers')}>Employers</button><button className="admin-dashboard-link" type="button" onClick={() => changeAdminView('service-providers')}>Customers</button></div></div>
    {adminView === 'payments' ? <AdminPaymentStatus providers={providers} /> : adminView === 'employers' ? <AdminEmployers employers={employers} /> : adminView === 'service-providers' ? <AdminServiceProviders customers={customers} /> : <>
    <div className="admin-dashboard-grid">
      <div className="admin-stat"><strong>{activeProviderCount}</strong><span>Active Service Providers</span></div>
      <div className="admin-stat"><strong>{inactiveProviderCount}</strong><span>Inactive Service Providers</span></div>
      <div className="admin-stat"><strong>{blockedProviderCount}</strong><span>Blocked Service Providers</span></div>
    </div>
    <AdminTableSection title="Active Service Providers" description="Monitor approved service providers profiles.">
      <div className="admin-table-search"><label><span>Search</span><input type="search" value={activeProviderSearch} onChange={(event) => setActiveProviderSearch(event.target.value)} placeholder="Name or mobile number" aria-label="Search Active Service Providers by name or mobile number" /></label></div>
      <div className="admin-table-wrap">
        <table className="admin-table" id="service-providers">
          <SortableTableHeader columns={activeProviderColumns} sort={activeProviderSort} onSort={sortActiveProvidersBy} />
          <tbody>{sortedActiveProviders.length ? sortedActiveProviders.map((provider) => <tr key={provider.id}>{activeProviderColumns.map(({ key, render }) => <td key={`${provider.id}-${key}`}>{render(provider)}</td>)}</tr>) : <tr><td className="admin-table-empty" colSpan={activeProviderColumns.length}>No service providers match your search.</td></tr>}</tbody>
        </table>
      </div>
    </AdminTableSection>
    <AdminTableSection title="Service Providers Access" description="Block or unblock service providers and record Admin comments.">
      <div className="admin-table-search"><label><span>Search</span><input type="search" value={accessProviderSearch} onChange={(event) => setAccessProviderSearch(event.target.value)} placeholder="Name or mobile number" aria-label="Search Service Providers Access by name or mobile number" /></label></div>
      <div className="admin-table-wrap">
        <table className="admin-table access-table">
          <SortableTableHeader columns={accessProviderColumns} sort={accessProviderSort} onSort={sortAccessProvidersBy} />
          <tbody>{sortedAccessProviders.length ? sortedAccessProviders.map((provider) => <tr key={provider.id}>{accessProviderColumns.map(({ key, render }) => <td key={`${provider.id}-${key}`}>{render(provider)}</td>)}</tr>) : <tr><td className="admin-table-empty" colSpan={accessProviderColumns.length}>No service providers match your search.</td></tr>}</tbody>
        </table>
      </div>
    </AdminTableSection>
    <AdminTableSection eyebrow="Admin Review Required" title="Newly Registered Service Providers" description="Review service providers details and approve new profiles.">
      <div className="admin-table-search"><label><span>Search</span><input type="search" value={pendingProviderSearch} onChange={(event) => setPendingProviderSearch(event.target.value)} placeholder="Name or mobile number" aria-label="Search Newly Registered Service Providers by name or mobile number" /></label></div>
      <div className="admin-table-wrap">
        <table className="admin-table approval-table">
          <SortableTableHeader columns={pendingProviderColumns} sort={pendingProviderSort} onSort={sortPendingProvidersBy} />
          <tbody>{sortedPendingProviders.length ? sortedPendingProviders.map((provider) => <tr key={provider.id}>{pendingProviderColumns.map(({ key, render }) => <td key={`${provider.id}-${key}`}>{render(provider)}</td>)}</tr>) : <tr><td className="admin-table-empty" colSpan={pendingProviderColumns.length}>No service providers match your search.</td></tr>}</tbody>
        </table>
      </div>
    </AdminTableSection>
    </>}
    {confirmation && <div className="admin-confirm-backdrop" role="presentation"><section className="admin-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><p className="eyebrow">Confirm action</p><h3 id="confirm-title">{confirmation.action} provider?</h3><p>{confirmation.action} {confirmation.provider.name} will update their provider access status.</p><div className="admin-confirm-actions"><button className="table-action" onClick={() => setConfirmation(null)}>Cancel</button><button className="table-action approve" onClick={() => { confirmation.onConfirm(); setConfirmation(null) }}>Confirm</button></div></section></div>}
  </div>
}

export function AdminServiceProviders({ customers }) {
  const [search, setSearch] = useState('')
  const filteredCustomers = filterAdminProviderRows(customers, search)

  return <div>
    <AdminTableSection description="Customer names and contact details.">
      <div className="admin-table-search"><label><span>Search</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Customer name or mobile number" aria-label="Search customer records by customer name or mobile number" /></label></div>
      <div className="admin-table-wrap"><table className="admin-table service-provider-list-table"><thead><tr><th>Customer Name</th><th>Mobile Number</th><th>Address</th></tr></thead><tbody>{filteredCustomers.length ? filteredCustomers.map((customer) => <tr key={customer.id}><td><strong>{customer.name}</strong></td><td>{customer.mobile}</td><td>{customer.address}</td></tr>) : <tr><td className="admin-table-empty" colSpan={3}>No customer records found.</td></tr>}</tbody></table></div>
    </AdminTableSection>
  </div>
}

export function AdminEmployers({ employers }) {
  return <section className="admin-employers-page" aria-label="Employers">
    <p className="admin-payment-intro">Registered employer profiles and account status.</p>
    <EmployerProfilesTable employers={employers} />
  </section>
}

export function EmployerProfilesTable({ employers }) {
  return <div className="admin-table-wrap">
    <table className="admin-table employer-profiles-table">
      <thead><tr><th>Employer Name</th><th>Mobile Number</th><th>Address</th><th>Status</th></tr></thead>
      <tbody>{employers.length ? employers.map((employer) => <tr key={employer.id}>
        <td><strong>{employer.name}</strong></td>
        <td>{employer.mobile}</td>
        <td>{employer.address}</td>
        <td><span className={employer.status === 'Resigned' ? 'table-status blocked' : 'table-status complete'}>{employer.status}</span></td>
      </tr>) : <tr><td className="admin-table-empty" colSpan={4}>No employer profiles found.</td></tr>}</tbody>
    </table>
  </div>
}

export function AdminPaymentStatus({ providers }) {
  const [paymentSort, setPaymentSort] = useState({ key: 'providerName', direction: 'asc' })
  const [fromPaymentDate, setFromPaymentDate] = useState('')
  const [toPaymentDate, setToPaymentDate] = useState('')
  const { minDate, maxDate } = getAdminPaymentDateBounds()
  const hasDateFilter = Boolean(fromPaymentDate || toPaymentDate)
  const invalidDateRange = Boolean(fromPaymentDate && toPaymentDate && fromPaymentDate > toPaymentDate)
  const getPaymentAmounts = (provider) => {
    const amount = Number(provider.amount) || 0
    const isPendingWithCustomer = String(provider.paymentStatus || '').toLowerCase().includes('pending with customer')
    const customerPays = isPendingWithCustomer ? 0 : amount
    const platformFee = isPendingWithCustomer ? 0 : amount * getAppCommissionRate(amount) / 100
    return { customerPays, providerReceives: customerPays - platformFee, platformFee }
  }
  const columns = [
    { key: 'providerName', label: 'Service Provider Name', value: (provider) => provider.name || '', render: (provider) => <strong>{provider.name}</strong> },
    { key: 'providerMobile', label: 'Mobile Number', value: (provider) => provider.mobile || '', render: (provider) => provider.mobile },
    { key: 'serviceAddress', label: 'Service Address', value: (provider) => provider.address || '', render: (provider) => provider.address },
    { key: 'customerName', label: 'Customer Name', value: (provider) => provider.customer || '', render: (provider) => provider.customer },
    { key: 'customerMobile', label: 'Customer Mobile Number', value: (provider) => provider.customerMobile || '', render: (provider) => provider.customerMobile },
    { key: 'customerAddress', label: 'Customer Address', value: (provider) => provider.customerAddress || '', render: (provider) => provider.customerAddress },
    { key: 'paymentStatus', label: 'Payment Status', value: (provider) => provider.paymentStatus || '', render: (provider) => <span className={String(provider.paymentStatus).includes('done') ? 'table-status complete' : 'table-status progress'}>{provider.paymentStatus}</span> },
    { key: 'paymentDate', label: 'Payment Date & Time', value: (provider) => provider.paymentDate || '', sortType: 'date', render: (provider) => formatAdminApprovalDateTime(provider.paymentDate) },
    { key: 'customerPays', label: 'Customer Pays', value: (provider) => getPaymentAmounts(provider).customerPays, sortType: 'number', render: (provider) => `₹${getPaymentAmounts(provider).customerPays.toLocaleString('en-IN')}` },
    { key: 'providerReceives', label: 'Service Provider Receives', value: (provider) => getPaymentAmounts(provider).providerReceives, sortType: 'number', render: (provider) => `₹${getPaymentAmounts(provider).providerReceives.toLocaleString('en-IN')}` },
    { key: 'platformFee', label: 'Platform Fee', value: (provider) => getPaymentAmounts(provider).platformFee, sortType: 'number', render: (provider) => `₹${getPaymentAmounts(provider).platformFee.toLocaleString('en-IN')}` },
  ]
  const filteredProviders = providers.filter((provider) => provider.paymentStatus).filter((provider) => {
    const paymentDate = parseAdminApprovalDate(provider.paymentDate)
    if (!paymentDate) return !hasDateFilter
    const paymentDay = formatAdminDateInputValue(paymentDate)
    if (paymentDay < minDate || paymentDay > maxDate) return false
    return !invalidDateRange && (!fromPaymentDate || paymentDay >= fromPaymentDate) && (!toPaymentDate || paymentDay <= toPaymentDate)
  })
  const sortedProviders = sortAdminTableRows(filteredProviders, columns, paymentSort)
  const sortByColumn = (key) => setPaymentSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }))

  return <section className="admin-payment-page" aria-label="Payment status">
    <p className="admin-payment-intro">Track resolved customer payments and pending customer payments.</p>
    <div className="admin-payment-filters" aria-label="Search payments by date">
      <label><span>From date</span><input type="date" value={fromPaymentDate} min={minDate} max={maxDate} onChange={(event) => setFromPaymentDate(event.target.value)} aria-label="Payment date from" /></label>
      <label><span>To date</span><input type="date" value={toPaymentDate} min={minDate} max={maxDate} onChange={(event) => setToPaymentDate(event.target.value)} aria-label="Payment date to" /></label>
      <p>Choose dates within the last six months.</p>
      {hasDateFilter && <button className="admin-payment-clear" type="button" onClick={() => { setFromPaymentDate(''); setToPaymentDate('') }}>Clear dates</button>}
    </div>
    {invalidDateRange && <p className="admin-payment-range-error" role="alert">From date must be on or before To date.</p>}
    <div className="admin-table-wrap">
      <table className="admin-table payment-status-table">
        <SortableTableHeader columns={columns} sort={paymentSort} onSort={sortByColumn} />
        <tbody>{sortedProviders.length ? sortedProviders.map((provider) => <tr key={provider.id}>{columns.map(({ key, render }) => <td key={`${provider.id}-${key}`}>{render(provider)}</td>)}</tr>) : <tr><td className="admin-table-empty" colSpan={columns.length}>No payment records match the selected date range.</td></tr>}</tbody>
      </table>
    </div>
  </section>
}

export function AdminTableSection({ eyebrow, title, description, children }) {
  return <section className="admin-table-section"><div className="admin-section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}{title && <h3>{title}</h3>}<p>{description}</p></div></div>{children}</section>
}
