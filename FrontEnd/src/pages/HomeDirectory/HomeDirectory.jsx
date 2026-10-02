import { useState } from 'react'
import './HomeDirectory.css'

export function HomeDirectory({ requests }) {
  return <div className="home-directory-sections">
    <section className="home-directory-section" id="approved-customer-requests" aria-labelledby="approved-customer-requests-title">
      <div className="home-directory-heading">
        <p className="eyebrow">Approved work</p>
        <h2 id="approved-customer-requests-title">Approved Customer Requests</h2>
        <p>Approved requests and the Service Provider assigned to each one.</p>
      </div>
      <ApprovedCustomerRequestsTable requests={requests} />
    </section>
  </div>
}

function ApprovedCustomerRequestsTable({ requests }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'customer', direction: 'asc' })
  const columns = [
    { key: 'customer', label: 'Customer Name' },
    { key: 'customerMobile', label: 'Customer Mobile Number' },
    { key: 'address', label: 'Address' },
    { key: 'status', label: 'Approved Service Status' },
    { key: 'provider', label: 'Service Provider Name' },
    { key: 'providerMobile', label: 'Service Provider Mobile Number' },
  ]
  const searchText = search.trim().toLocaleLowerCase()
  const searchDigits = search.replace(/\D/g, '')
  const filteredRequests = requests.filter((request) => (
    request.customer.toLocaleLowerCase().includes(searchText)
    || (searchDigits && request.customerMobile.replace(/\D/g, '').includes(searchDigits))
  ))
  const sortedRequests = [...filteredRequests].sort((first, second) => {
    const comparison = String(first[sort.key] || '').localeCompare(String(second[sort.key] || ''), 'en', { numeric: true, sensitivity: 'base' })
    return sort.direction === 'asc' ? comparison : -comparison
  })
  const toggleSort = (key) => setSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }))

  return <div className="approved-requests-table-wrap">
    <div className="approved-requests-search">
      <label htmlFor="approved-customer-request-search">Search by Customer Name or Customer Mobile Number</label>
      <input id="approved-customer-request-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Enter a customer name or mobile number" />
    </div>
    <table className="approved-requests-table">
      <thead><tr>{columns.map((column) => <th key={column.key} scope="col" aria-sort={sort.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button type="button" className="approved-requests-sort-button" onClick={() => toggleSort(column.key)} aria-label={`Sort by ${column.label} ${sort.key === column.key && sort.direction === 'asc' ? 'descending' : 'ascending'}`}>
          <span>{column.label}</span><span className="approved-requests-sort-indicator" aria-hidden="true">{sort.key === column.key ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
        </button>
      </th>)}</tr></thead>
      <tbody>{sortedRequests.length ? sortedRequests.map((request) => <tr key={request.id}>
        <td><strong>{request.customer}</strong></td>
        <td>{request.customerMobile}</td>
        <td>{request.address}</td>
        <td>{request.status}</td>
        <td>{request.provider}</td>
        <td>{request.providerMobile}</td>
      </tr>) : <tr><td className="approved-requests-empty" colSpan={columns.length}>No approved customer requests match “{search}”.</td></tr>}</tbody>
    </table>
  </div>
}
