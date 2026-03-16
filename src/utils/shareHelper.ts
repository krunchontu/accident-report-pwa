export async function shareViaWhatsApp(text: string, file?: File): Promise<void> {
  if (navigator.share && file) {
    try {
      await navigator.share({ text, files: [file] });
      return;
    } catch {
      // fallback
    }
  }
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

export async function shareViaEmail(subject: string, body: string, file?: File): Promise<void> {
  if (navigator.share && file) {
    try {
      await navigator.share({ title: subject, text: body, files: [file] });
      return;
    } catch {
      // fallback
    }
  }
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

export async function shareFile(title: string, file: File): Promise<boolean> {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title, files: [file] });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
