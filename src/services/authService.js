export function getSession() {
  try {
    return JSON.parse(
      localStorage.getItem("medisync_session") || "null"
    );
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const session = getSession();

  if (!session?.email) {
    return false;
  }

  try {
    const accounts = JSON.parse(
      localStorage.getItem("medisync_accounts") || "[]"
    );

    return accounts.some(
      (account) =>
        account.email === session.email
    );
  } catch {
    return false;
  }
}

export function logout() {
  localStorage.removeItem("medisync_session");
}

export function getCurrentEmail() {
  const session = getSession();

  return session?.email || null;
}