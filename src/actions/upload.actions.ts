export async function saveMonthlyData(data: Record<string, unknown>) {
  const response = await fetch("/api/admin/upload-monthly", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to save monthly data: ${errorText}`);
  }

  return response.json();
}
