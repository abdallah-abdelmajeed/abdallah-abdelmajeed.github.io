document.addEventListener('DOMContentLoaded', function () {
  function applyTheme(theme) {
    var update = function () {
      document.documentElement.setAttribute('data-theme', theme);
      var btn = document.getElementById('theme-toggle');
      if (btn) {
        btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        btn.innerHTML =
          '<i class="fas ' + (theme === 'dark' ? 'fa-sun' : 'fa-moon') + '" aria-hidden="true"></i>';
      }
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', theme === 'dark' ? '#171613' : '#f4f1ea');
      if (mapObj) setMapTiles();
    };
    var reduceMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduceMotion) {
      document.startViewTransition(update);
    } else {
      update();
    }
  }

  var storedTheme = null;
  try {
    storedTheme = localStorage.getItem('theme');
  } catch (e) {}
  var prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : prefersDark ? 'dark' : 'light');

  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next =
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch (e) {}
      applyTheme(next);
    });
  }

  var savedLang = localStorage.getItem('siteLang') || 'en';
  document.documentElement.lang = savedLang === 'ar' ? 'ar' : savedLang === 'pl' ? 'pl' : 'en';
  document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('is-rtl', savedLang === 'ar');

  var header = document.getElementById('header');
  var tabButtons = document.querySelectorAll('.tab-button');
  var tabContent = document.getElementById('tab-content');
  var tabPanel = document.getElementById('tab-panel');
  var activeTab = 'about-me';
  var currentLang = savedLang;
  var UI = null;
  var postersCache = null;
  var loadSeq = 0;
  var authorCache = null;
  var activitiesCache = null;
  var paletteBackdrop = document.getElementById('palette');
  var paletteInput = document.getElementById('palette-input');
  var paletteResults = document.getElementById('palette-results');

  function isMobile() {
    return window.innerWidth < 768;
  }

  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
    var vc = document.getElementById('visitor-count');
    if (vc && !vc.hidden && vc.dataset.value) {
      vc.setAttribute('aria-label', t('visitor_label') + ' ' + vc.dataset.value);
    }
    renderHeroDynamic();
  }

  var fieldSitesCache = null;
  var mapObj = null;
  var tileLayer = null;

  function setMapTiles() {
    if (!mapObj) return;
    if (tileLayer) mapObj.removeLayer(tileLayer);
    tileLayer = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapObj);
  }

  function initFieldMap() {
    if (!UI || !window.L) return;
    var host = tabContent.querySelector('.card .p-8');
    if (!host || host.querySelector('.map-section')) return;
    var accent =
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2f6b4f';

    var section = document.createElement('div');
    section.className = 'map-section';
    section.innerHTML =
      '<h3>' + esc(t('map_heading')) + '</h3><div class="field-map" id="field-map"></div>';
    host.appendChild(section);

    var sites = fieldSitesCache
      ? Promise.resolve(fieldSitesCache)
      : fetch('./data/field-sites.json')
          .then(function (r) {
            if (!r.ok) throw new Error('field sites fetch failed');
            return r.json();
          })
          .then(function (d) {
            fieldSitesCache = d;
            return d;
          });

    if (mapObj && !document.body.contains(mapObj.getContainer())) mapObj = null;
    if (!mapObj) {
      mapObj = window.L.map(section.querySelector('#field-map'), {
        scrollWheelZoom: false,
        attributionControl: true
      }).setView([48.5, 12], 3);
      setMapTiles();
    } else {
      mapObj.invalidateSize();
    }

    sites
      .then(function (data) {
        if (!mapObj) return;
        var latlngs = [];
        ((data && data.items) || []).forEach(function (s) {
          var title = (s.title && (s.title[currentLang] || s.title.en)) || '';
          var desc = (s.desc && (s.desc[currentLang] || s.desc.en)) || '';
          latlngs.push([s.lat, s.lng]);
          window.L
            .circleMarker([s.lat, s.lng], {
              radius: 7,
              color: accent,
              weight: 2,
              fillColor: accent,
              fillOpacity: 0.85
            })
            .addTo(mapObj)
            .bindPopup(
              '<strong>' + esc(title) + '</strong><br>' + esc(desc)
            );
        });
        if (latlngs.length) {
          mapObj.fitBounds(latlngs, { padding: [24, 24], maxZoom: 6 });
        }
      })
      .catch(function () {});
  }

  var paletteItems = [];
  var paletteIndex = -1;
  var searchIndex = null;

  function buildSearchIndex() {
    var idx = [];
    tabButtons.forEach(function (b) {
      idx.push({
        label: b.textContent.trim(),
        kind: t('palette_kind_section'),
        action: function () {
          b.click();
        }
      });
    });
    idx.push({
      label:
        'Contrasting physiological responses of Sphagnum and vascular plants to a heatwave in a temperate peatland',
      kind: t('palette_kind_dataset'),
      action: function () {
        window.open('https://doi.org/10.18150/GDSYNE', '_blank', 'noopener');
      }
    });
    idx.push({
      label:
        'Midday depression and legacy effects disrupt SIF-GPP coupling in northern peatlands during combined heat and drought stress',
      kind: t('palette_kind_dataset'),
      action: function () {
        window.open('https://doi.org/10.18150/YXLKT4', '_blank', 'noopener');
      }
    });
    ((postersCache && postersCache.items) || []).forEach(function (p) {
      idx.push({
        label: (p.title && (p.title[currentLang] || p.title.en)) || '',
        kind: t('palette_kind_poster'),
        action: function () {
          var b = document.querySelector('[data-tab="publications"]');
          if (b) b.click();
        }
      });
    });
    ((activitiesCache && activitiesCache.items) || []).forEach(function (a) {
      idx.push({
        label: (a.title && (a.title[currentLang] || a.title.en)) || '',
        kind: t('palette_kind_activity'),
        action: function () {
          var b = document.querySelector('[data-tab="about-me"]');
          if (b) b.click();
        }
      });
    });
    if (window.PublicationsFeed && typeof PublicationsFeed.getWorks === 'function') {
      PublicationsFeed.getWorks()
        .then(function (ws) {
          (ws || []).slice(0, 80).forEach(function (w) {
            idx.push({
              label: w.display_name || w.title || '',
              kind: t('palette_kind_publication'),
              action: function () {
                var u = w.doi || (w.primary_location && w.primary_location.landing_page_url) || w.id || '';
                if (u) window.open(u, '_blank', 'noopener');
              }
            });
          });
          renderPalette();
        })
        .catch(function () {});
    }
    return idx;
  }

  function renderPalette() {
    var q = paletteInput.value.toLowerCase().trim();
    paletteItems = searchIndex
      .filter(function (i) {
        return !q || i.label.toLowerCase().indexOf(q) !== -1;
      })
      .slice(0, 12);
    paletteIndex = paletteItems.length ? 0 : -1;
    paletteResults.innerHTML = paletteItems.length
      ? paletteItems
          .map(function (i, n) {
            return (
              '<button type="button" class="palette-item' +
              (n === paletteIndex ? ' selected' : '') +
              '" role="option"><span class="pi-label">' +
              esc(i.label) +
              '</span><span class="pi-kind">' +
              esc(i.kind) +
              '</span></button>'
            );
          })
          .join('')
      : '<p class="palette-empty">' + esc(t('palette_no_results')) + '</p>';
    Array.prototype.forEach.call(
      paletteResults.querySelectorAll('.palette-item'),
      function (el, n) {
        el.addEventListener('click', function () {
          choosePaletteItem(n);
        });
        el.addEventListener('mousemove', function () {
          setSelectedPaletteItem(n);
        });
      }
    );
  }

  function setSelectedPaletteItem(n) {
    paletteIndex = n;
    Array.prototype.forEach.call(
      paletteResults.querySelectorAll('.palette-item'),
      function (el, i) {
        el.classList.toggle('selected', i === n);
      }
    );
  }

  function choosePaletteItem(n) {
    var item = paletteItems[n];
    closePalette();
    if (item && item.action) item.action();
  }

  function openPalette() {
    if (!searchIndex) searchIndex = buildSearchIndex();
    paletteBackdrop.hidden = false;
    paletteInput.value = '';
    renderPalette();
    paletteInput.focus();
  }

  function closePalette() {
    paletteBackdrop.hidden = true;
  }

  function initVisitorCounter() {
    var el = document.getElementById('visitor-count');
    if (!el || el.dataset.counterBound === '1') return;
    el.dataset.counterBound = '1';
    var counted = false;
    try {
      counted = sessionStorage.getItem('visitCounted') === '1';
    } catch (e) {}
    fetch(
      'https://abacus.jasoncameron.dev/' +
        (counted ? 'get' : 'hit') +
        '/abdallah-abdelmajeed/site-visits'
    )
      .then(function (r) {
        if (!r.ok) throw new Error('counter unavailable');
        return r.json();
      })
      .then(function (d) {
        try {
          sessionStorage.setItem('visitCounted', '1');
        } catch (e) {}
        el.dataset.value = d.value;
        var numEl = document.getElementById('visitor-value');
        if (numEl) numEl.textContent = d.value;
        el.setAttribute('aria-label', t('visitor_label') + ' ' + d.value);
        el.hidden = false;
      })
      .catch(function () {});
  }

  function fetchAuthor() {
    var feed = window.PublicationsFeed;
    if (!feed || !feed.AUTHOR_ID) return Promise.reject(new Error('no author id'));
    if (authorCache) return Promise.resolve(authorCache);
    return fetch('https://api.openalex.org/authors/' + feed.AUTHOR_ID)
      .then(function (r) {
        if (!r.ok) throw new Error('author fetch failed');
        return r.json();
      })
      .then(function (a) {
        authorCache = a;
        return a;
      });
  }

  function countUp(el, target) {
    var reduceMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      el.textContent = target;
      return;
    }
    var start = null;
    var duration = 700;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  function renderHeroDynamic() {
    var statsEl = document.getElementById('hero-stats');
    var latestEl = document.getElementById('latest-work');

    if (statsEl) {
      if (authorCache) {
        var s = authorCache.summary_stats || {};
        var parts = [];
        if (authorCache.works_count != null) parts.push({ n: authorCache.works_count, l: t('stats_works') });
        if (authorCache.cited_by_count != null) parts.push({ n: authorCache.cited_by_count, l: t('stats_citations') });
        if (s.h_index != null) parts.push({ n: s.h_index, l: t('stats_hindex') });
        if (parts.length) {
          statsEl.innerHTML =
            parts
              .map(function (p) {
                return (
                  '<div class="stat"><span class="stat-num" data-target="' +
                  esc(p.n) +
                  '">0</span><span class="stat-label">' +
                  esc(p.l) +
                  '</span></div>'
                );
              })
              .join('') + '<span class="stat-src">' + esc(t('stats_source')) + '</span>';
          statsEl.hidden = false;
          statsEl.querySelectorAll('.stat-num').forEach(function (numEl) {
            countUp(numEl, parseInt(numEl.getAttribute('data-target'), 10) || 0);
          });
        }
      } else {
        fetchAuthor()
          .then(function () {
            renderHeroDynamic();
          })
          .catch(function () {});
      }
    }

    if (latestEl && window.PublicationsFeed && typeof PublicationsFeed.getWorks === 'function') {
      PublicationsFeed.getWorks()
        .then(function (works) {
          var w = works && works[0];
          if (!w) return;
          var title = w.display_name || w.title || '';
          var url = w.doi || (w.primary_location && w.primary_location.landing_page_url) || w.id || '';
          var html = '<span class="latest-label">' + esc(t('latest_article_label')) + '</span> ';
          html += url
            ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(title) + '</a>'
            : esc(title);
          if (w.publication_year) html += ' <span>(' + esc(String(w.publication_year)) + ')</span>';
          latestEl.innerHTML = html;
          latestEl.hidden = false;
        })
        .catch(function () {});
    }
  }

  function renderActivityFeed() {
    if (!UI) return;
    var host = tabContent.querySelector('.card .p-8') || tabContent.querySelector('.card');
    if (!host || host.querySelector('.activity-section')) return;
    var section = document.createElement('div');
    section.className = 'activity-section';
    section.innerHTML =
      '<h3>' + esc(t('activity_heading')) + '</h3>' +
      '<div class="activity-list"><p class="activity-loading">…</p></div>';
    host.appendChild(section);
    var listEl = section.querySelector('.activity-list');

    var activities = activitiesCache
      ? Promise.resolve(activitiesCache)
      : fetch('./data/activities.json')
          .then(function (r) {
            if (!r.ok) throw new Error('activities fetch failed');
            return r.json();
          })
          .then(function (d) {
            activitiesCache = d;
            return d;
          });

    var works =
      window.PublicationsFeed && typeof PublicationsFeed.getWorks === 'function'
        ? PublicationsFeed.getWorks().catch(function () { return []; })
        : Promise.resolve([]);

    Promise.all([activities, works])
      .then(function (results) {
        var items = [];
        var acts = (results[0] && results[0].items) || [];
        acts.forEach(function (a) {
          var title = (a.title && (a.title[currentLang] || a.title.en)) || '';
          var kind = (a.kind && (a.kind[currentLang] || a.kind.en)) || '';
          if (title) {
            items.push({ sortKey: a.date || '', display: (a.date || '').slice(0, 7), kind: kind, title: title, url: '' });
          }
        });
        (results[1] || []).slice(0, 3).forEach(function (w) {
          var title = w.display_name || w.title || '';
          if (!title) return;
          var url = w.doi || (w.primary_location && w.primary_location.landing_page_url) || w.id || '';
          items.push({
            sortKey: w.publication_year ? String(w.publication_year) + '-12' : '',
            display: w.publication_year ? String(w.publication_year) : '',
            kind: t('activity_pub_kind'),
            title: title,
            url: url
          });
        });
        items.sort(function (a, b) { return (b.sortKey || '').localeCompare(a.sortKey || ''); });
        items = items.slice(0, 7);
        if (!items.length) {
          listEl.innerHTML = '';
          return;
        }
        listEl.innerHTML = items
          .map(function (it) {
            var titleHtml = it.url
              ? '<a href="' + esc(it.url) + '" target="_blank" rel="noopener noreferrer">' + esc(it.title) + '</a>'
              : esc(it.title);
            return (
              '<div class="activity-item">' +
              '<span class="activity-date">' + esc(it.display) + '</span>' +
              '<div class="activity-body">' +
              '<span class="activity-kind">' + esc(it.kind) + '</span>' +
              '<span class="activity-title">' + titleHtml + '</span>' +
              '</div></div>'
            );
          })
          .join('');
      })
      .catch(function () {
        listEl.innerHTML = '';
      });
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
    input.addEventListener('input', filterPublications);
    var btn = input.nextElementSibling;
    if (btn && btn.tagName === 'BUTTON') btn.addEventListener('click', filterPublications);
  }

  function initContactFormI18n() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var sub = form.querySelector('input[name="_subject"]');
    if (sub) sub.value = t('form_email_subject');
  }

  function initContactExtras() {
    var emailLink = tabContent.querySelector('.card a[href="mailto:ay1214@fayoum.edu.eg"]');
    if (!emailLink) return;
    var existing = emailLink.parentElement.querySelector('.copy-email');
    if (existing) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-email';
    btn.setAttribute('aria-label', t('copy_email_aria'));
    btn.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i>';
    btn.addEventListener('click', function () {
      navigator.clipboard
        .writeText('ay1214@fayoum.edu.eg')
        .then(function () {
          btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i>';
            btn.classList.remove('copied');
          }, 1500);
        })
        .catch(function () {});
    });
    emailLink.insertAdjacentElement('afterend', btn);
  }

  function initTabScripts(tabId) {
    if (tabId === 'publications') initPublicationsFilter();
    if (tabId === 'contact') {
      initContactFormI18n();
      initContactExtras();
    }
    if (tabId === 'about-me') renderActivityFeed();
    if (tabId === 'research') initFieldMap();
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
    var token = ++loadSeq;
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
        poster_kind_label: t('poster_kind_label'),
        poster_link_label: t('poster_link_label')
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
          if (token !== loadSeq) return;
          tabContent.innerHTML = result.html;
          initTabScripts('publications');
          if (opts.scrollOnMobile && isMobile()) {
            tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        })
        .catch(function (e) {
          if (token !== loadSeq) return;
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
        if (token !== loadSeq) return;
        tabContent.innerHTML = html;
        initTabScripts(tabId);
        if (opts.scrollOnMobile && isMobile()) {
          tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      })
      .catch(function (err) {
        if (token !== loadSeq) return;
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
      initVisitorCounter();
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

      var paletteOpenBtn = document.getElementById('palette-open');
      if (paletteOpenBtn && paletteBackdrop && paletteInput && paletteResults) {
        paletteOpenBtn.addEventListener('click', openPalette);
        paletteInput.addEventListener('input', renderPalette);
        paletteInput.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (paletteItems.length) setSelectedPaletteItem(Math.min(paletteIndex + 1, paletteItems.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (paletteItems.length) setSelectedPaletteItem(Math.max(paletteIndex - 1, 0));
          } else if (e.key === 'Enter') {
            if (paletteIndex >= 0 && paletteItems[paletteIndex]) choosePaletteItem(paletteIndex);
          } else if (e.key === 'Escape') {
            closePalette();
          }
        });
        paletteBackdrop.addEventListener('click', function (e) {
          if (e.target === paletteBackdrop) closePalette();
        });
        document.addEventListener('keydown', function (e) {
          if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            if (paletteBackdrop.hidden) {
              openPalette();
            } else {
              closePalette();
            }
          }
        });
      }

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

      var toTop = document.getElementById('to-top');
      if (toTop) {
        var updateToTop = function () {
          toTop.hidden = window.scrollY <= 600;
        };
        window.addEventListener('scroll', updateToTop, { passive: true });
        updateToTop();
        toTop.addEventListener('click', function () {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    });
});
