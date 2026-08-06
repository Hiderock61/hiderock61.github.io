const menuToggle = document.querySelector('.menu-toggle');
const globalNav = document.querySelector('.global-nav');

if (menuToggle && globalNav) {
  const closeMenu = () => {
    globalNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'メニューを開く');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = globalNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  });

  globalNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
}

const form = document.querySelector('#demo-form');
const confirmation = document.querySelector('#confirmation');

if (form && confirmation) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    const errors = {
      name: name ? '' : 'お名前を入力してください。',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'メールアドレスの形式を確認してください。',
      message: message ? '' : 'お問い合わせ内容を入力してください。'
    };

    document.querySelector('#name-error').textContent = errors.name;
    document.querySelector('#email-error').textContent = errors.email;
    document.querySelector('#message-error').textContent = errors.message;

    if (errors.name || errors.email || errors.message) {
      confirmation.hidden = true;
      form.querySelector('.error-message:not(:empty)')?.previousElementSibling?.focus();
      return;
    }

    confirmation.innerHTML = `<h3>入力内容の確認</h3><dl><dt>お名前</dt><dd>${escapeHtml(name)}</dd><dt>メールアドレス</dt><dd>${escapeHtml(email)}</dd><dt>お問い合わせ内容</dt><dd>${escapeHtml(message)}</dd></dl><p class="form-footnote">これは確認表示です。内容は送信・保存されていません。</p>`;
    confirmation.hidden = false;
    confirmation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
