export function RoutePage({ name, children }) {
  return <main className={`route-page route-page--${name}`}>{children}</main>
}
