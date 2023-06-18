/*!
 * Core App
 * Copyright 2014-2022 PSA Developing team
 */

function createCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toGMTString()}`;
  }
  document.cookie = `${name}=${value}${expires}; path=/`;
}

function getCookie(cname) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function getLang() {
  return getCookie('_lng');
}

function formatAmount(amount) {
  const format = wNumb({
    // prefix: ' د.إ  ',
    decimals: 2,
    thousand: ',',
  });

  return format.to(amount);
}

function changeLang(lng) {
  let ref = true;
  if (getLang() === '' && lng === 'ar') ref = false;
  createCookie('_lng', lng, 365);
  if (ref) location.reload();
}

function getDir() {
  return getCookie('_lng') === 'ar' ? 'rtl' : 'ltr';
}

function request(url, options = { method: 'GET' }) {
  const headers = {
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (!options.files) headers['Content-Type'] = 'application/json; charset=UTF-8';

  if (options.form) {
    const formRef = options.form;
    if (typeof jQuery === 'function' && formRef instanceof jQuery) {
      // eslint-disable-next-line prefer-destructuring
      options.body = new URLSearchParams(formRef.serialize());
    }
    if (formRef instanceof HTMLFormElement) {
      options.body = new URLSearchParams(new FormData(formRef));
    }
    delete headers['Content-Type'];
  }

  return fetch(BASE_URL + url, {
    ...options,
    headers,
    credentials: 'same-origin',
  })
    .then(async (response) => {
      if (response.status === 204 || response.status === 205) {
        return null;
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error(__('You are not authorized to perform this action'));
      }
      if (options.fetchFile) {
        return response.blob();
      }

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const bodyText = await response.text();
          return bodyText ? JSON.parse(bodyText) : null;
        }
        if (contentType && contentType.indexOf('text/html') !== -1) {
          const bodyText = await response.text();
          return bodyText;
        }
        return {};
      } catch (e) {
        return response ? response.json() : null;
      }
    })
    .then((response) => {
      if (response && response.message && !response.success) {
        //console.log(response)
        const error = new Error(response.message);
        throw error;
      }
      return response;
    });
  // .catch(parseJSON);
}
