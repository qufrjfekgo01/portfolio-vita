/*
  신청 폼 처리. 입력값은 어디로도 보내지 않습니다.
  - 폼 입력칸에는 name 속성이 없어서, 스크립트가 꺼져 있어도 값이 주소창·서버로 넘어가지 않습니다.
  - 제출 → 개인정보 안내 팝업 → 동의 → 입력값 즉시 삭제 → result.html 이동.
  - 나중에 폼을 Make·구글시트 등에 연결하면 팝업 문구(index.html의 #privacy-modal)를 반드시 고쳐야 합니다.
*/
(function () {
  var form = document.getElementById('lead-form');
  var modal = document.getElementById('privacy-modal');
  if (!modal) return;
  var agree = document.getElementById('privacy-agree');
  var ok = document.getElementById('privacy-ok');
  var cancel = document.getElementById('privacy-cancel');
  var mode = 'info';

  function wipe() {
    if (!form) return;
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
      else el.value = '';
    });
    form.reset();
  }

  function track(eventName, params) {
    if (typeof window.gtag === 'function') window.gtag('event', eventName, params || {});
  }

  function open(m, entryPoint) {
    mode = m;
    track('privacy_notice_open', { entry_point: entryPoint || 'form', modal_mode: m });
    agree.checked = false;
    ok.disabled = true;
    ok.textContent = m === 'submit' ? '동의하고 완료하기' : '확인했습니다';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    agree.focus();
  }

  function close(method) {
    track('privacy_notice_dismiss', { consent_context: mode, dismiss_method: method || 'unknown' });
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  agree.addEventListener('change', function () {
    ok.disabled = !agree.checked;
    if (agree.checked) track('privacy_notice_consent', { consent_context: mode, action: 'checked' });
  });
  cancel.addEventListener('click', function () { close('button'); });
  modal.addEventListener('click', function (e) { if (e.target === modal) close('backdrop'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) close('escape'); });

  ok.addEventListener('click', function () {
    if (mode !== 'submit') {
      track('privacy_notice_acknowledge', { consent_context: 'info' });
      close('acknowledge');
      return;
    }
    wipe();
    // 입력값을 수집하지 않고 완료 이벤트만 전송합니다.
    track('generate_lead', { lead_type: 'purchase_inquiry', item_id: 'vita_gummy' });
    if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
    location.replace('result.html');
  });

  document.querySelectorAll('[data-privacy-open]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      var entryPoint = b.closest('header') ? 'header' : (b.closest('footer') ? 'footer' : 'form');
      open('info', entryPoint);
    });
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = form.checkValidity();
      track('form_submit_attempt', { form_id: 'lead_form', form_valid: valid });
      if (!valid) {
        form.querySelectorAll('input, select, textarea').forEach(function (field) {
          if (field.validity.valid) return;
          var errorType = field.validity.valueMissing ? 'required' : (field.validity.patternMismatch ? 'pattern' : 'invalid');
          track('form_validation_error', {
            form_id: 'lead_form',
            field_name: field.id === 'f-name' ? 'name' : (field.id === 'f-contact' ? 'contact' : 'other'),
            error_type: errorType
          });
        });
        form.reportValidity();
        return;
      }
      open('submit', 'form');
    });
  }

  // 검토 메모 패널 닫기 (검토용 빌드에만 있음)
  var rp = document.querySelector('.review-panel button');
  if (rp) rp.addEventListener('click', function () { rp.parentNode.remove(); });
})();
