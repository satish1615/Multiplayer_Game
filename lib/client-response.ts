export class RoomServiceError extends Error {
  status: number;
  constructor(status: number, pageResponse = false) {
    const message = status === 403
      ? "Room access was blocked. Open the game in its own browser tab and try again."
      : status >= 500
        ? "The room service is temporarily unavailable. Please try again shortly."
        : pageResponse
          ? "The room request opened a web page instead of the game service. Open the game in its own browser tab and try again."
          : "The room service sent an unreadable reply. Refresh the game and try again.";
    super(message + ` (HTTP ${status})`);
    this.name = "RoomServiceError";
    this.status = status;
  }
}

// Hosting/sign-in/error pages can be returned even when fetch succeeds. Never
// treat them as room data or clear a saved seat because a proxy returned HTML.
export async function readGameResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (!/\bapplication\/(?:[\w.-]+\+)?json\b/i.test(contentType)) {
    throw new RoomServiceError(response.status, /html/i.test(contentType));
  }
  let value: unknown;
  try { value = await response.json(); }
  catch { throw new RoomServiceError(response.status); }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new RoomServiceError(response.status);
  if (!response.ok && !("error" in value && typeof value.error === "string" && value.error.trim())) {
    throw new RoomServiceError(response.status);
  }
  return value as T;
}
