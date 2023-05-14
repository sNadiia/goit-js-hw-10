import './css/styles.css';
import { fetchCountries } from './fetchCountries';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const DEBOUNCE_DELAY = 300;

const refs = {
  searchBox: document.getElementById('search-box'),
  countryList: document.querySelector('.country-list'),
  countryInfo: document.querySelector('.country-info'),
};

refs.searchBox.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

function onInput(e) {
  const inputValue = e.target.value.trim();

  if (inputValue === '') {
    return;
  } else {
    fetchCountries()
      .then(countries => {
        const searchCountries = countries.filter(country =>
          country.name.official.toLowerCase().includes(inputValue)
        );

        if (searchCountries.length > 10) {
          clearList();
          clearInfo();
          Notify.failure(
            'Too many matches found. Please enter a more specific name.'
          );
          return;
        } else {
          if (searchCountries.length > 1 && searchCountries.length < 10) {
            clearList();
            clearInfo();
            const markupOfCountries = searchCountries.reduce(
              (markup, searchCountry) =>
                markup + createMarkupList(searchCountry),
              ''
            );
            return updateList(markupOfCountries);
          } else {
            if (searchCountries.length === 1) {
              clearList();
              clearInfo();
              const searchCountry = searchCountries[0];
              const markupOfCountry = createMarkupInfo(searchCountry);
              return updateInfo(markupOfCountry);
            } else {
              clearList();
              clearInfo();
              return Notify.failure('Oops, there is no country with that name');
            }
          }
        }
      })
      .catch(err => {
        console.log('err');
      });
  }
}

function createMarkupList({ name, flags }) {
  const nameOfficial = name.official;
  const flagSvg = flags.svg;

  return `
    <li class="country-item">
    <img class="country-item-img" src="${flagSvg}"  width="30" height="20" />
        <p class="country-item-name">${nameOfficial}</p>`;
}

function createMarkupInfo({ name, flags, capital, population, languages }) {
  const nameOfficial = name.official;
  const flagSvg = flags.svg;
  const language = Object.values(languages);

  return `
  <div class="country-info-header">
  <img class="country-info-img" src="${flagSvg}"  width="40" />
  <h2 class="country-info-name">${nameOfficial}</h2>
</div>
<ul class="country-info-list">
  <li class="country-info-item">
    <h3 class="country-info-title">Capital:</h3>
    <p class="country-info-text">${capital}</p>
  </li>
  <li class="country-info-item">
    <h3 class="country-info-title">Population:</h3>
    <p class="country-info-text">${population}</p>
  </li>
  <li class="country-info-item">
    <h3 class="country-info-title">Languages:</h3>
    <p class="country-info-text">${language}</p>
  </li>
</ul>`;
}

function updateList(markup) {
  refs.countryList.insertAdjacentHTML('beforeend', markup);
}

function updateInfo(markup) {
  refs.countryInfo.insertAdjacentHTML('beforeend', markup);
}

function clearList() {
  refs.countryList.innerHTML = '';
}

function clearInfo() {
  refs.countryInfo.innerHTML = '';
}
