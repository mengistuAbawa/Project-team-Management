export function hasRole(user, roles = []) {
  return Boolean(user && roles.includes(user.role));
}
