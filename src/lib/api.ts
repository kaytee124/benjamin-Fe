/** Production benjamin-be (public for now). */
export const API_BASE = "https://benjamin-be-2.onrender.com";

/** Base URL for benjamin-be (no trailing slash). */
export function getApiBase(): string {
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:4000";
  }
  return API_BASE;
}
