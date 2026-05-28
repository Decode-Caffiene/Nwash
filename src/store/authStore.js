const authStore = {
  getToken() {
    return localStorage.getItem("access_token");
  },
  setToken(token) {
    if (token) localStorage.setItem("access_token", token);
  },
  clearToken() {
    localStorage.removeItem("access_token");
  },
};

export default authStore;
