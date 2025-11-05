export async function scanCheck(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/scan-check", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to scan check")
  }

  return response.json()
}
