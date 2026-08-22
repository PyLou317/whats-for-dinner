export async function deleteProfileRequest(): Promise<void> {
  const res = await fetch("/api/profile", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    let message = "Unable to delete profile.";
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
}