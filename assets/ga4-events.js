(function () {
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link) return;

    var label = (link.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 80);
    var href = link.getAttribute('href') || '';

    if (link.matches('.coupon')) {
      track('select_promotion', {
        promotion_name: 'new_member_coupon',
        creative_slot: 'product_info',
        destination: 'apply'
      });
      return;
    }

    if (link.id === 'cta-main' || /구매하기|구매$/.test(label)) {
      track('purchase_cta_click', {
        cta_location: link.closest('footer') ? 'footer' : (link.id === 'cta-main' ? 'product' : 'navigation'),
        destination: href.indexOf('#') === 0 ? href.slice(1) : 'page'
      });
      return;
    }

    if (href.indexOf('#') === 0 || href === './') {
      track('navigation_click', {
        link_text: label || 'logo',
        destination: href === './' ? 'home' : href.slice(1)
      });
    }
  });
})();
