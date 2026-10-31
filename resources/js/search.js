const searchInput = document.getElementById('search-input');
const searchItems = document.querySelectorAll('.search-item');
const noResults = document.getElementById('no-results');
let timeoutId;

function startsWith(text, searchText) {
  return text.split(/\s+/).some(word => word.startsWith(searchText));
}

function toBasicLatin(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function search() {
  const searchText = toBasicLatin(searchInput.value.toLowerCase());
  document.querySelectorAll('h2').forEach(h2 => {
    h2.style.display = searchText === '' ? 'block' : 'none';
  });
  searchInput.style.marginBottom = searchText === '' ? '' : '1rem';
  let noResultsFlag = true;
  searchItems.forEach(item => {
    let itemText = toBasicLatin(item.textContent.toLowerCase());
    if (startsWith(itemText, searchText) || itemText.includes(searchText)) {
      item.style.display = 'block';
      noResultsFlag = false;
    } else {
      item.style.display = 'none';
    }
  });
  if (noResultsFlag && searchText !== '') {
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }
}

searchInput.addEventListener('input', function() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(function() {
    search();
  }, 1);
});

searchInput.addEventListener('keypress', function(event) {
  if (searchInput.value && event.key === 'Enter') {
    window.location.href = document
      .querySelector('.search-item[style="display: block;"]')
      .querySelector('a')
      .getAttribute('href');
  }
});