(async () => {
  try {
    // Unregister any existing service workers
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    // Clear all caches created by older versions
    if (window.caches?.keys) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    // Add a one-time cache-busting param to the URL so HTML itself isn't cached
    const url = new URL(location.href);
    if (!url.searchParams.has('_v')) {
      url.searchParams.set('_v', Date.now().toString());
      location.replace(url.toString()); // reload once with the _v param
    }
  } catch (e) {
    console.log('nocache error', e);
  }
})();
