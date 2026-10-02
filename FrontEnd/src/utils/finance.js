export function getAppCommissionRate(amount) {
  return Number(amount) > 10000 ? 5 : 10
}
