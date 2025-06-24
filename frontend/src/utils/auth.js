export function setLogin() {
  localStorage.setItem('isLoggedIn', 'true');
}

export function setLogout() {
  localStorage.removeItem('isLoggedIn');
}

export function isLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
} 