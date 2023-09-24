let target = document.querySelector(window.location.hash);

function wrap(element) {
  element.innerHTML = element.innerHTML
    .split('\n')
    .map(line => `<span class="highlighted">${line}</span>`)
    .join('\n');
}

function highlight() {
  if (target?.id !== 'tone-generator') {
    if (target.tagName === 'P') {
      wrap(target);
    } else {
      target.querySelectorAll('img').forEach(img => img.classList.add('highlighted'));
      target.querySelectorAll('figcaption').forEach(wrap);
      target.querySelectorAll('h1, h2, h3, h4').forEach(wrap);
      target.querySelectorAll('p').forEach(wrap);
      target.querySelectorAll('.scordatura-loader').forEach(wrap);
    }
  }
}

highlight();

function updateHash() {
  document.querySelectorAll('span.highlighted').forEach(span => {
    span.parentNode.replaceChild(document.createTextNode(span.textContent), span);
  });
  document.querySelectorAll('.highlighted').forEach(element => {
    element.classList.remove('highlighted');
  });
  target = document.querySelector(window.location.hash);
  highlight();
}

window.addEventListener('hashchange', updateHash);