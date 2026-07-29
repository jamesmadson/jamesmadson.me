document.addEventListener('DOMContentLoaded', function () {
  const ul = document.querySelector('.client_logos');
  if (!ul) return;
  const containerWidth = ul.parentElement.offsetWidth;
  let tries = 0;
  while (ul.scrollWidth < containerWidth * 2 && tries < 10) {
    Array.from(ul.querySelectorAll('[aria-hidden="true"]')).forEach(li => ul.appendChild(li.cloneNode(true)));
    tries++;
  }
});
