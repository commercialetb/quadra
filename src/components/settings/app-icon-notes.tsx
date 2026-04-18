export function AppIconNotes() {
  return (
    <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold tracking-tight">Icone app e PWA</h3>
      <p className="mt-2 text-sm text-neutral-600">
        Questa patch aggiunge manifest, apple-touch-icon e icone base per Home Screen su iPhone e iPad.
      </p>
      <ul className="mt-3 space-y-2 text-sm text-neutral-700">
        <li>• public/apple-touch-icon.png</li>
        <li>• public/icons/icon-192.png</li>
        <li>• public/icons/icon-512.png</li>
        <li>• public/manifest.webmanifest</li>
      </ul>
    </section>
  );
}
