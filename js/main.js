document.addEventListener('DOMContentLoaded', function () {
  var savedLang = localStorage.getItem('siteLang') || 'en';
  document.documentElement.lang = savedLang === 'ar' ? 'ar' : savedLang === 'pl' ? 'pl' : 'en';
  document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('is-rtl', savedLang === 'ar');

  var header = document.getElementById('header');
  var tabButtons = document.querySelectorAll('.tab-button');
  var tabContent = document.getElementById('tab-content');
  var tabPanel = document.getElementById('tab-panel');
  var activeTab = 'about-me';
  var wasMobile = window.innerWidth < 768;
  var currentLang = savedLang;
  var UI = null;
  var postersCache = null;

  function isMobile() {
    return window.innerWidth < 768;
  }

  function t(key) {
    if (!UI) return '';
    var pack = UI[currentLang] || UI.en;
    if (pack && pack[key] != null) return pack[key];
    return (UI.en && UI.en[key]) || '';
  }

  function applyShellI18n() {
    if (!UI) return;
    document.documentElement.lang = currentLang === 'ar' ? 'ar' : currentLang === 'pl' ? 'pl' : 'en';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('is-rtl', currentLang === 'ar');
    document.title = t('meta_title');
    var metaD = document.querySelector('meta[name="description"]');
    if (metaD) metaD.setAttribute('content', t('meta_description'));
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      var val = t(key);
      if (el.getAttribute('data-i18n-attr') === 'placeholder') {
        el.setAttribute('placeholder', val);
      } else if (el.getAttribute('data-i18n-attr') === 'aria') {
        el.setAttribute('aria-label', val);
      } else if (el.getAttribute('data-i18n-html') === '1') {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      var l = btn.getAttribute('data-lang');
      btn.classList.toggle('lang-btn-active', l === currentLang);
      btn.setAttribute('aria-pressed', l === currentLang ? 'true' : 'false');
    });
    var heroPhoto = document.getElementById('hero-photo');
    if (heroPhoto) heroPhoto.setAttribute('alt', t('hero_img_alt'));
  }

  function setLang(lang) {
    if (!['en', 'ar', 'pl'].includes(lang)) return;
    currentLang = lang;
    localStorage.setItem('siteLang', lang);
    applyShellI18n();
    loadTabContent(activeTab, { scrollOnMobile: false });
  }

  function initPublicationsFilter() {
    var input = document.getElementById('pub-search');
    if (!input || input.dataset.filterBound === '1') return;
    input.dataset.filterBound = '1';

    function filterPublications() {
      var q = input.value.toLowerCase().trim();
      document.querySelectorAll('#publications-list .pub-item').forEach(function (pub) {
        var hay = pub.getAttribute('data-search') || pub.textContent.toLowerCase();
        pub.style.display = !q || hay.indexOf(q) !== -1 ? '' : 'none';
      });
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') filterPublications();
    });
    var btn = input.nextElementSibling;
    if (btn && btn.tagName === 'BUTTON') btn.addEventListener('click', filterPublications);
  }

  function initContactFormI18n() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var sub = form.querySelector('input[name="_subject"]');
    if (sub) sub.value = t('form_email_subject');
  }

  function initTabScripts(tabId) {
    if (tabId === 'publications') initPublicationsFilter();
    if (tabId === 'contact') initContactFormI18n();
  }

  function setActiveTabButton(activeButton) {
    tabButtons.forEach(function (btn) {
      var on = btn === activeButton;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.setAttribute('tabindex', on ? '0' : '-1');
    });
    if (tabPanel && activeButton && activeButton.id) {
      tabPanel.setAttribute('aria-labelledby', activeButton.id);
    }
  }

  function tabUrl(tabId) {
    return './tabs/' + encodeURIComponent(currentLang) + '/' + encodeURIComponent(tabId) + '.html';
  }

  function loadTabContent(tabId, options) {
    var opts = options || {};
    if (tabId === 'publications') {
      if (!window.PublicationsFeed || typeof window.PublicationsFeed.buildPublicationsHtml !== 'function') {
        tabContent.innerHTML =
          '<div class="card tab-error-card"><div class="p-8"><p class="text-gray-700">' +
          t('tab_error_load') +
          '</p></div></div>';
        return;
      }
      var strings = {
        publications_page_title: t('publications_page_title'),
        pub_search_placeholder: t('pub_search_placeholder'),
        pub_search_btn: t('pub_search_btn'),
        pub_search_label: t('pub_search_label'),
        pub_section_works: t('pub_section_works'),
        pub_section_posters: t('pub_section_posters'),
        pub_error: t('pub_error'),
        pub_refresh_note: t('pub_refresh_note'),
        pub_empty_works: t('pub_empty_works'),
        pub_empty_posters: t('pub_empty_posters'),
        pub_badge_citations: t('pub_badge_citations'),
        poster_kind_label: t('poster_kind_label')
      };
      var posterPromise = postersCache
        ? Promise.resolve(postersCache)
        : fetch('./data/posters.json').then(function (r) {
            if (!r.ok) throw new Error('posters');
            return r.json();
          });
      posterPromise
        .then(function (data) {
          postersCache = data;
          return window.PublicationsFeed.buildPublicationsHtml(currentLang, strings, data);
        })
        .then(function (result) {
          tabContent.innerHTML = result.html;
          initTabScripts('publications');
          if (opts.scrollOnMobile && isMobile()) {
            tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        })
        .catch(function (e) {
          console.error(e);
          tabContent.innerHTML =
            '<div class="card tab-error-card"><div class="p-8"><p class="text-gray-700">' +
            t('tab_error_load') +
            '</p></div></div>';
        });
      return;
    }

    fetch(tabUrl(tabId))
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      })
      .then(function (html) {
        tabContent.innerHTML = html;
        initTabScripts(tabId);
        if (opts.scrollOnMobile && isMobile()) {
          tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      })
      .catch(function (err) {
        console.error('Error loading tab content:', err);
        tabContent.innerHTML =
          '<div class="card tab-error-card"><div class="p-8"><p class="text-gray-700 leading-relaxed">' +
          t('tab_error_load') +
          '</p></div></div>';
      });
  }

  function activateTab(button, options) {
    var opts = options || {};
    var tabId = button.getAttribute('data-tab');
    if (!tabId) return;
    setActiveTabButton(button);
    loadTabContent(tabId, { scrollOnMobile: !!opts.scrollOnMobile });
    activeTab = tabId;
  }

  fetch('./i18n/ui.json')
    .then(function (r) {
      if (!r.ok) throw new Error('ui');
      return r.json();
    })
    .then(function (data) {
      UI = data;
    })
    .catch(function () {
      UI = null;
      console.warn('Could not load i18n/ui.json; shell stays in default HTML language.');
    })
    .then(function () {
      applyShellI18n();
      if (header) {
        window.addEventListener('scroll', function () {
          if (window.scrollY > 50) {
            header.classList.add('shadow-md', 'header-scrolled');
          } else {
            header.classList.remove('shadow-md', 'header-scrolled');
          }
        });
      }

      document.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          setLang(btn.getAttribute('data-lang'));
        });
      });

      tabButtons.forEach(function (button, index) {
        if (!button.id) button.id = 'tab-' + button.getAttribute('data-tab');
        button.setAttribute('role', 'tab');
        if (tabPanel) button.setAttribute('aria-controls', 'tab-panel');

        button.addEventListener('click', function () {
          activateTab(button, { scrollOnMobile: isMobile() });
        });

        button.addEventListener('keydown', function (e) {
          var next = null;
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            next = tabButtons[(index + 1) % tabButtons.length];
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            next = tabButtons[(index - 1 + tabButtons.length) % tabButtons.length];
          } else if (e.key === 'Home') {
            next = tabButtons[0];
          } else if (e.key === 'End') {
            next = tabButtons[tabButtons.length - 1];
          }
          if (next) {
            e.preventDefault();
            next.focus();
            activateTab(next, { scrollOnMobile: isMobile() });
          }
        });
      });

      var initial = document.querySelector('.tab-button.active') || tabButtons[0];
      if (initial) {
        setActiveTabButton(initial);
        activeTab = initial.getAttribute('data-tab') || 'about-me';
        loadTabContent(activeTab, { scrollOnMobile: false });
      }

      window.addEventListener('resize', function () {
        var nowMobile = isMobile();
        if (nowMobile !== wasMobile) {
          wasMobile = nowMobile;
          loadTabContent(activeTab, { scrollOnMobile: false });
        }
      });
    });
});
