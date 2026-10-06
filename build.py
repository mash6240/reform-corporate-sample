"""_src/ のページ断片と共通レイアウトから、各HTMLを生成するスクリプト"""
from pathlib import Path
root = Path(__file__).parent
layout = (root / '_src/layout.html').read_text(encoding='utf-8')
pages = {'index': 'home', 'service': 'service', 'works': 'works', 'company': 'company', 'contact': 'contact'}
for name, slug in pages.items():
    src = (root / f'_src/{name}.html').read_text(encoding='utf-8')
    head, content = src.split('---\n', 1)
    meta = dict(line.split(': ', 1) for line in head.strip().splitlines())
    html = layout.replace('{{TITLE}}', meta['TITLE']).replace('{{DESC}}', meta['DESC']).replace('{{SLUG}}', slug).replace('{{CONTENT}}', content.rstrip('\n'))
    for s in ['home', 'service', 'works', 'company']:
        html = html.replace('{{CUR_%s}}' % s, ' aria-current="page"' if s == slug else '')
    (root / f'{name}.html').write_text(html, encoding='utf-8')
    print('built', name)
