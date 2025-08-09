(async () => {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    if (window.caches?.keys) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    const url = new URL(location.href);
    if (!url.searchParams.has('_v')) {
      url.searchParams.set('_v', Date.now().toString());
      location.replace(url.toString());
    }
  } catch (e) {
    console.log('nocache error', e);
  }
})();
