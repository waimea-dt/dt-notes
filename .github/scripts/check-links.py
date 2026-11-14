#!/usr/bin/env python3
"""Check internal links and images in the docs/ Markdown.

Reports links to pages, images and files that don't exist. Run from the repo
root:  python3 .github/scripts/check-links.py

Planned pages should exist as a stub holding <coming-soon></coming-soon>,
so sidebar and menu links are checked like any other.
Skipped: code blocks, inline code, external URLs, temp/ drafts, AI notes and
the plugin docs (which contain example paths).

Docsify resolves links from the site root, while Markdown images resolve
from the page's folder, so a target counts as found if it exists relative
to either.

Exit code 1 if anything is broken; on GitHub Actions each problem is also
reported as a file/line annotation.
"""
import os
import re
import sys
from pathlib import Path

DOCS = Path('docs')
SKIP_DIRS = {'temp', '_plugins'}
SKIP_FILES = {'CLAUDE.md', 'AGENTS.md'}
PAGE_SUFFIXES = ('', '.md')

MD_LINK = re.compile(r'!?\[(?:[^\[\]]|\[[^\]]*\])*\]\(\s*<?([^)\s>]+)>?(?:\s+[^)]*)?\)')
HTML_ATTR = re.compile(r'\b(?:src|href)\s*=\s*"([^"]+)"')
FENCE = re.compile(r'^\s*(```|~~~)')
INLINE_CODE = re.compile(r'`[^`]*`')
EXTERNAL = re.compile(r'^(?:[a-z][a-z0-9+.-]*:|//|#|\?)', re.I)


def target_exists(page: Path, url: str) -> bool:
    path = url.split('#')[0].split('?')[0]
    if not path:
        return True
    rel = path.lstrip('/')
    bases = [DOCS] if path.startswith('/') else [page.parent, DOCS]
    for base in bases:
        t = Path(os.path.normpath(base / rel))
        if path.endswith('/'):
            if (t / 'README.md').is_file():
                return True
            continue
        if t.suffix:
            if t.is_file():
                return True
            continue
        # Extensionless route: a page, or a folder with a README
        if any(Path(str(t) + s).is_file() for s in PAGE_SUFFIXES) or (t / 'README.md').is_file():
            return True
    return False


def check_file(page: Path):
    problems = []
    in_fence = False
    for lineno, line in enumerate(page.read_text(encoding='utf-8').splitlines(), 1):
        if FENCE.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        text = INLINE_CODE.sub('', line)
        for url in MD_LINK.findall(text) + HTML_ATTR.findall(text):
            if EXTERNAL.match(url) or '${' in url or '{{' in url:
                continue
            if not target_exists(page, url):
                problems.append((lineno, url))
    return problems


def main():
    on_ci = os.environ.get('GITHUB_ACTIONS') == 'true'
    total = 0
    for page in sorted(DOCS.rglob('*.md')):
        rel = page.relative_to(DOCS)
        if any(part in SKIP_DIRS for part in rel.parts) or page.name in SKIP_FILES:
            continue
        for lineno, url in check_file(page):
            total += 1
            print(f'{page}:{lineno}: broken link: {url}')
            if on_ci:
                print(f'::error file={page},line={lineno},title=Broken link::{url}')
    print(f'\n{total} broken link(s)' if total else 'No broken links found.')
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main())
