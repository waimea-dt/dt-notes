/**
 * docsify-definitions.js - Auto-links glossary terms in page content using <abbr> tags.
 *
 * The plugin loads glossary entries, then post-processes rendered markdown so matching
 * terms get a definition tooltip in the title attribute.
 *
 * Usage in markdown:
 *   Define terms in _glossary.md as list entries, for example:
 *   - CPU
 *     Central Processing Unit
 */

(function () {
  let glossary = {};
  let glossaryLoaded = false;

  const defaultOptions = {
    glossaryPath: '_glossary.md',
    replaceOnlyFirst: false, // Change to false to replace all occurrences
    caseSensitive: false,
  };

  function parseGlossary(markdown) {
    const glossaryMap = {};
    const lines = markdown.split('\n');
    let currentTerm = null;
    let currentDefinition = '';

    for (let i = 0; i < lines.length; i++) {
      // Remove carriage returns (Windows line endings)
      let line = lines[i].replace(/\r$/, '');

      // Check for term (list item starting with -)
      const termMatch = line.match(/^-\s+(.+)$/);
      if (termMatch) {
        // Save previous term if exists
        if (currentTerm && currentDefinition.trim()) {
          glossaryMap[currentTerm] = currentDefinition.trim();
        }

        // Start new term
        currentTerm = termMatch[1].trim();
        currentDefinition = '';
      } else if (currentTerm) {
        // Check if this is a new section header
        if (line.startsWith('#')) {
          // New section header - save current term and reset
          if (currentDefinition.trim()) {
            glossaryMap[currentTerm] = currentDefinition.trim();
          }
          currentTerm = null;
          currentDefinition = '';
        } else if (line.trim()) {
          // Non-empty line that's not a header - must be part of definition
          currentDefinition += line.trim() + ' ';
        }
        // Empty lines are just skipped (they separate term from definition)
      }
    }

    // Save last term
    if (currentTerm && currentDefinition.trim()) {
      glossaryMap[currentTerm] = currentDefinition.trim();
    }

    return glossaryMap;
  }

  // Skipped with everything inside: code, existing abbr tags, menu cards, quiz/flashcard content
  // (would leak answers via tooltips), and plugin content marked up as plain HTML before its
  // plugin runs (animation.js: step/beat captions and teacher notes)
  const SKIP = 'code, pre, abbr, script, style, quiz, flashcards, drag-drop, menu, .anim-source';

  // Two patterns for all terms, built once when the glossary loads: terms with a capital letter
  // match exactly, all-lowercase terms match in any case. Each allows a plural 's'.
  let matchers = [];

  function buildMatchers() {
    const terms = Object.keys(glossary);
    const lowercaseDefinitions = new Map(terms.map(term => [term.toLowerCase(), glossary[term]]));
    const pattern = (list, flags) => {
      // Longest first, so a longer term wins over a shorter one at the same place
      const alternatives = list.sort((a, b) => b.length - a.length).map(escapeRegExp).join('|');
      return new RegExp(`\\b(${alternatives})s?\\b`, flags);
    };
    const exact = terms.filter(term => /[A-Z]/.test(term));
    const anyCase = terms.filter(term => !/[A-Z]/.test(term));
    matchers = [
      exact.length && { regex: pattern(exact, 'g'), definition: term => glossary[term] },
      anyCase.length && { regex: pattern(anyCase, 'gi'), definition: term => lowercaseDefinitions.get(term.toLowerCase()) },
    ].filter(Boolean);
  }

  // The terms in a piece of text, longest first where two overlap: { start, end, text, term }
  function findTerms(text) {
    const found = [];
    for (const { regex, definition } of matchers) {
      for (const match of text.matchAll(regex)) {
        found.push({ start: match.index, end: match.index + match[0].length, text: match[0], definition: definition(match[1]), key: match[1].toLowerCase() });
      }
    }
    found.sort((a, b) => (b.end - b.start) - (a.end - a.start) || a.start - b.start);
    const kept = [];
    for (const term of found) {
      if (!kept.some(other => term.start < other.end && other.start < term.end)) kept.push(term);
    }
    return kept.sort((a, b) => a.start - b.start);
  }

  function textNodesToSearch(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.nodeType === Node.ELEMENT_NODE
        ? (node.matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP)
        : (node.data.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  function createAbbr(term) {
    const abbr = document.createElement('abbr');
    abbr.setAttribute('data-tooltip', term.definition);
    abbr.textContent = term.text;
    abbr.classList.add('glossary-term');
    return abbr;
  }

  function addAbbreviations(content, options) {
    if (!matchers.length) {
      return content;
    }

    const container = document.createElement('div');
    container.innerHTML = content;
    const used = new Set(); // for replaceOnlyFirst

    textNodesToSearch(container).forEach(node => {
      let terms = findTerms(node.data);
      if (options.replaceOnlyFirst) {
        terms = terms.filter(term => !used.has(term.key) && used.add(term.key));
      }
      if (!terms.length) return;

      // Rebuild the text node as text, abbr, text, abbr, ...
      const fragment = document.createDocumentFragment();
      let at = 0;
      terms.forEach(term => {
        if (term.start > at) fragment.append(node.data.slice(at, term.start));
        fragment.append(createAbbr(term));
        at = term.end;
      });
      if (at < node.data.length) fragment.append(node.data.slice(at));
      node.replaceWith(fragment);
    });

    return container.innerHTML;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Install plugin
  function install(hook, vm) {
    const options = Object.assign({}, defaultOptions, vm.config.definitions || {});
    let glossaryLoadPromise = null;

    // Load glossary on init
    hook.init(function () {
      const glossaryPath = options.glossaryPath;

      glossaryLoadPromise = fetch(glossaryPath)
        .then(response => {
          if (!response.ok) {
            console.warn(`Definitions plugin: Could not load glossary from ${glossaryPath}`);
            return '';
          }
          return response.text();
        })
        .then(text => {
          if (text) {
            glossary = parseGlossary(text);
            buildMatchers();
            glossaryLoaded = true;
          }
        })
        .catch(err => {
          console.warn('Definitions plugin: Error loading glossary', err);
        });
    });

    // Process content after each page render
    hook.afterEach(function (html, next) {
      // Wait for glossary to load if it's still loading
      if (glossaryLoadPromise && !glossaryLoaded) {
        glossaryLoadPromise.then(() => {
          if (glossaryLoaded) {
            html = addAbbreviations(html, options);
          }
          next(html);
        });
      } else if (glossaryLoaded) {
        html = addAbbreviations(html, options);
        next(html);
      } else {
        next(html);
      }
    });

    // Note: Tooltip positioning is handled by the tooltips.js plugin
    // which provides smart positioning for all [data-tooltip] elements
  }

  // Add plugin to docsify
  window.DocsifyUtils.registerPlugin(install)
})();

