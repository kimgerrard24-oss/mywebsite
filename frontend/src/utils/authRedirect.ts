// frontend/src/utils/authRedirect.ts

export function redirectToLogin(delayMs = 1500) {
  setTimeout(() => {
    window.location.href = "/login";
  }, delayMs);
}
