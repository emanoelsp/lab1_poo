export async function uploadPdf(uid: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("uid", uid);

  const response = await fetch("/api/upload-pdf", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(body.error ?? "Erro desconhecido no upload.");
  }

  const { url } = await response.json();
  return url as string;
}
