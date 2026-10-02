export const formPaths = {
  admin: '/Admin',
  contact: '/ContactUs',
  customer: '/CustomerRequest',
  feedback: '/Feedback',
  labour: '/ServiceProviderRegistration',
  payment: '/PaymentExchange',
  wnpocket: '/WNPocket',
  'close-account': '/CloseAccount',
  resign: '/Resign',
  'service-history': '/Servicehistory',
}

export const adminViewPaths = {
  providers: '/Admin/ServiceProvidersManagement',
  payments: '/Admin/PaymentStatus',
  employers: '/Admin/Employers',
  'service-providers': '/Admin/Customers',
}

export function homePathForProfile(profileType) {
  if (profileType === 'Service Provider') return '/ServiceProviderHome'
  if (profileType === 'Admin') return '/Home'
  if (profileType === 'Employer') return '/EmployerHome'
  return '/CustomerHome'
}

export function getRouteState(pathname = window.location.pathname) {
  const path = pathname.toLowerCase()
  if (path === '/signin') return { entryScreen: 'signin', activeForm: null, submitted: false, adminView: 'providers' }
  if (path === '/signup') return { entryScreen: 'signup', activeForm: null, submitted: false, adminView: 'providers' }
  /*if (path === '/signout') return { entryScreen: 'signout', activeForm: null, submitted: false, adminView: 'providers' }*/
  if (path === '/admin/paymentstatus') return { entryScreen: 'app', activeForm: 'admin', submitted: true, adminView: 'payments' }
  if (path === '/admin/employers') return { entryScreen: 'app', activeForm: 'admin', submitted: true, adminView: 'employers' }
  if (path === '/admin/customers' || path === '/admin/serviceproviders') return { entryScreen: 'app', activeForm: 'admin', submitted: true, adminView: 'service-providers' }
  if (path === '/admin/serviceprovidersmanagement') return { entryScreen: 'app', activeForm: 'admin', submitted: true, adminView: 'providers' }
  if (path === '/admin') return { entryScreen: 'app', activeForm: 'admin', submitted: false, adminView: 'providers' }
  if (path === '/customerhome' || path === '/customer') return { entryScreen: 'app', activeForm: null, submitted: false, adminView: 'providers', profileAccountType: 'Customer' }
  if (path === '/serviceproviderhome' || path === '/serviceprovider') return { entryScreen: 'app', activeForm: null, submitted: false, adminView: 'providers', profileAccountType: 'Service Provider' }
  if (path === '/employerhome' || path === '/employer') return { entryScreen: 'app', activeForm: null, submitted: false, adminView: 'providers', profileAccountType: 'Employer' }

  const formRoute = Object.entries(formPaths).find(([, routePath]) => routePath.toLowerCase() === path)
  if (formRoute) return { entryScreen: 'app', activeForm: formRoute[0], submitted: false, adminView: 'providers' }
  if (path === '/home') return { entryScreen: 'app', activeForm: null, submitted: false, adminView: 'providers' }
  return { entryScreen: 'landing', activeForm: null, submitted: false, adminView: 'providers' }
}

export function pushPath(path) {
  if (window.location.pathname !== path) window.history.pushState({}, '', path)
}
