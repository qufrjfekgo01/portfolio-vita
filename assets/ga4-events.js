(function () {
(function () {
  function trackMeta(name, params) {
    if (name === 'page_view' || name.indexOf('scroll') === 0) return;
    if (window.fbq) {
      var events = {
        generate_lead: 'Lead',
        sign_up: 'CompleteRegistration',
        contact_click: 'Contact',
        view_item: 'ViewContent',
        add_to_cart: 'AddToCart',
        begin_checkout: 'InitiateCheckout',
        search: 'Search'
      };
      if (name === 'purchase') {
        if (window.fbq) fbq('track', 'Purchase', {
          value: params && params.value,
          currency: 'KRW'
        });
      } else if (events[name]) {
        if (window.fbq) fbq('track', events[name]);
      } else {
        if (window.fbq) fbq('trackCustom', name);
      }
    }
  }
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    trackMeta(name, params);
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
