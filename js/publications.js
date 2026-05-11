/**
 * Fetches works from OpenAlex (by author id), deduplicates, and renders HTML.
 * OpenAlex data: https://docs.openalex.org — polite use; results cached in-memory per session.
 */
(function (global) {
  'use strict';

  var AUTHOR_ID = 'A5025312253';
  var WORKS_URL =
    'https://api.openalex.org/works?filter=author.id:' +
    AUTHOR_ID +
    '&sort=publication_year:desc&per_page=50';

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function normalizeDoi(doi) {
    if (!doi) return '';
    return String(doi)
      .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
      .toLowerCase()
      .trim();
  }

  function normalizeTitle(title) {
    return String(title || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function workPrimaryUrl(w) {
    var doi = w.doi;
    if (doi) return doi.indexOf('http') === 0 ? doi : 'https://doi.org/' + normalizeDoi(doi);
    var loc = w.primary_location || w.best_oa_location;
    if (loc && loc.landing_page_url) return loc.landing_page_url;
    if (loc && loc.pdf_url) return loc.pdf_url;
    return w.id || '';
  }

  function workVenue(w) {
    var loc = w.primary_location;
    if (!loc) return '';
    if (loc.source && loc.source.display_name) return loc.source.display_name;
    if (loc.landing_page_url) return loc.landing_page_url;
    return '';
  }

  function formatAuthors(w) {
    var list = w.authorships || [];
    var names = list
      .map(function (a) {
        return a && a.author && a.author.display_name;
      })
      .filter(Boolean);
    if (!names.length) return '';
    if (names.length <= 3) return names.join(', ');
    return names.slice(0, 2).join(', ') + ', et al.';
  }

  /**
   * Unique by OpenAlex id; drop extra rows sharing the same DOI or same title+year.
   */
  function dedupeWorks(results) {
    var byId = new Map();
    results.forEach(function (w) {
      if (w && w.id) byId.set(w.id, w);
    });
    var sorted = Array.from(byId.values()).sort(function (a, b) {
      var ya = a.publication_year || 0;
      var yb = b.publication_year || 0;
      if (yb !== ya) return yb - ya;
      return (b.cited_by_count || 0) - (a.cited_by_count || 0);
    });
    var seenDoi = new Set();
    var seenTitleYear = new Set();
    var out = [];
    sorted.forEach(function (w) {
      var doi = normalizeDoi(w.doi);
      if (doi && seenDoi.has(doi)) return;
      var ty = (w.publication_year || 0) + '|' + normalizeTitle(w.display_name || w.title);
      if (seenTitleYear.has(ty)) return;
      if (doi) seenDoi.add(doi);
      seenTitleYear.add(ty);
      out.push(w);
    });
    return out;
  }

  async function fetchAllWorks() {
    var all = [];
    var url = WORKS_URL;
    var safety = 0;
    while (url && safety < 20) {
      safety += 1;
      var res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('OpenAlex HTTP ' + res.status);
      var data = await res.json();
      (data.results || []).forEach(function (w) {
        all.push(w);
      });
      var cursor = data.meta && data.meta.next_cursor;
      if (cursor) {
        url = WORKS_URL + '&cursor=' + encodeURIComponent(cursor);
      } else {
        url = null;
      }
    }
    return dedupeWorks(all);
  }

  function workCardHtml(w, strings) {
    var title = w.display_name || w.title || 'Untitled';
    var url = workPrimaryUrl(w);
    var venue = workVenue(w);
    var year = w.publication_year || '—';
    var cited = w.cited_by_count != null ? w.cited_by_count : 0;
    var authors = formatAuthors(w);
    var type = (w.type || '').replace(/_/g, ' ');
    var badges =
      '<span class="badge text-[#4a90e2] border-[#e1effe] border">' +
      escapeHtml(String(year)) +
      '</span>';
    if (venue) {
      badges +=
        '<span class="badge text-[#4a90e2] border-[#e1effe] border">' +
        escapeHtml(venue.slice(0, 40) + (venue.length > 40 ? '…' : '')) +
        '</span>';
    }
    if (type) {
      badges +=
        '<span class="badge text-[#4a90e2] border-[#e1effe] border">' +
        escapeHtml(type) +
        '</span>';
    }
    badges +=
      '<span class="badge text-[#4a90e2] border-[#e1effe] border">' +
      escapeHtml(strings.pub_badge_citations + ': ' + cited) +
      '</span>';

    var titleHtml = escapeHtml(title);
    if (url) {
      titleHtml =
        '<a href="' +
        escapeHtml(url) +
        '" target="_blank" rel="noopener noreferrer" class="text-[#4a90e2] hover:underline inline-flex items-center gap-1">' +
        titleHtml +
        ' <i class="fas fa-external-link-alt h-3 w-3" aria-hidden="true"></i></a>';
    }

    return (
      '<div class="p-5 border border-gray-100 rounded-lg hover:border-[#e1effe] hover:bg-gray-50 transition-colors pub-item" data-search="' +
      escapeHtml(
        [title, venue, authors, year, type, w.doi].filter(Boolean).join(' ').toLowerCase()
      ) +
      '">' +
      '<p class="text-gray-700 mb-2 text-justify">' +
      (authors ? '<span class="font-medium">' + escapeHtml(authors) + '</span>. ' : '') +
      '(' +
      escapeHtml(String(year)) +
      '). ' +
      titleHtml +
      (venue ? '. <span class="italic">' + escapeHtml(venue) + '</span>.' : '') +
      '</p>' +
      '<div class="flex flex-wrap gap-2">' +
      badges +
      '</div></div>'
    );
  }

  function posterCard(p, lang, strings) {
    var title = (p.title && p.title[lang]) || p.title.en || '';
    var body = (p.body && p.body[lang]) || p.body.en || '';
    var tags = (p.tags && p.tags[lang]) || p.tags.en || [];
    var badges = (tags || [])
      .map(function (t) {
        return (
          '<span class="badge text-[#4a90e2] border-[#e1effe] border">' + escapeHtml(t) + '</span>'
        );
      })
      .join('');
    return (
      '<div class="p-5 border border-gray-100 rounded-lg hover:border-[#e1effe] hover:bg-gray-50 transition-colors pub-item" data-search="' +
      escapeHtml((title + ' ' + body).toLowerCase()) +
      '">' +
      '<h3 class="font-medium text-gray-900 mb-1">' +
      escapeHtml(title) +
      '</h3>' +
      '<p class="text-gray-700 mb-2 text-justify">' +
      escapeHtml(body) +
      '</p>' +
      '<p class="text-gray-600 text-sm italic">' +
      escapeHtml(strings.poster_kind_label) +
      '</p>' +
      '<div class="flex flex-wrap gap-2 mt-2">' +
      badges +
      '</div></div>'
    );
  }

  async function buildPublicationsHtml(lang, strings, postersPayload) {
    var worksSection = '';
    var postersSection = '';
    var errMsg = '';

    try {
      var works = await fetchAllWorks();
      worksSection = works.map(function (w) {
        return workCardHtml(w, strings);
      }).join('');
    } catch (e) {
      console.error(e);
      errMsg = strings.pub_error;
    }

    var posterItems = (postersPayload && postersPayload.items) || [];
    postersSection = posterItems.map(function (p) {
      return posterCard(p, lang, strings);
    }).join('');

    return {
      html:
        '<div class="card bg-white rounded-lg shadow-md overflow-hidden" aria-label="' +
        escapeHtml(strings.publications_page_title) +
        '">' +
        '<div class="bg-[#f0f7ff] px-8 py-4 border-b border-[#e1effe]">' +
        '<h1 class="text-2xl font-semibold text-[#2e5f96] flex items-center gap-3" id="publications-title">' +
        '<i class="fas fa-book h-6 w-6 text-[#4a90e2]" aria-hidden="true"></i>' +
        escapeHtml(strings.publications_page_title) +
        '</h1></div>' +
        '<div class="p-8">' +
        '<p class="text-sm text-gray-500 mb-4 pub-openalex-note">' +
        escapeHtml(strings.pub_refresh_note) +
        '</p>' +
        (errMsg ? '<p class="text-red-700 mb-4" role="alert">' + escapeHtml(errMsg) + '</p>' : '') +
        '<div class="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center pub-search-row">' +
        '<label for="pub-search" class="sr-only">' +
        escapeHtml(strings.pub_search_label) +
        '</label>' +
        '<input id="pub-search" type="search" placeholder="' +
        escapeHtml(strings.pub_search_placeholder) +
        '" class="border border-gray-200 rounded px-3 py-2 w-full sm:w-80 input-focus-ring" aria-label="' +
        escapeHtml(strings.pub_search_label) +
        '">' +
        '<button type="button" class="ml-0 sm:ml-2 px-4 py-2 btn-pub-search text-white rounded transition-colors" aria-label="' +
        escapeHtml(strings.pub_search_btn) +
        '">' +
        escapeHtml(strings.pub_search_btn) +
        '</button></div>' +
        '<div class="space-y-8" id="publications-list">' +
        '<section><h2 class="text-xl font-semibold text-[#2e5f96] mb-4 pb-2 border-b border-gray-200">' +
        escapeHtml(strings.pub_section_works) +
        '</h2>' +
        '<div class="space-y-3 mt-4">' +
        (worksSection ||
          '<p class="text-gray-600">' + escapeHtml(strings.pub_empty_works) + '</p>') +
        '</div></section>' +
        '<section><h2 class="text-xl font-semibold text-[#2e5f96] mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">' +
        '<i class="fas fa-file h-5 w-5 text-[#4a90e2]" aria-hidden="true"></i>' +
        escapeHtml(strings.pub_section_posters) +
        '</h2>' +
        '<div class="space-y-2 mt-4">' +
        (postersSection ||
          '<p class="text-gray-600">' + escapeHtml(strings.pub_empty_posters) + '</p>') +
        '</div></section>' +
        '</div></div></div>',
      hadError: !!errMsg
    };
  }

  global.PublicationsFeed = {
    buildPublicationsHtml: buildPublicationsHtml
  };
})(typeof window !== 'undefined' ? window : this);
