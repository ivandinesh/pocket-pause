from html_scripts import Scripts
source='<!-- <script>ignored</script> --><style>.x:after{content:"<script>"}</style><SCRIPT id="x" data-note="a > b">const x="<tag>";</SCRIPT><script type="application/ld+json">{"a":"b"}</script>'
scripts=Scripts(source).scripts
assert len(scripts)==2
assert scripts[0].body=='const x="<tag>";'
assert dict(scripts[0].attrs)['data-note']=='a > b'
assert source[scripts[0].start:scripts[0].end].startswith('<SCRIPT')
assert dict(scripts[1].attrs)['type']=='application/ld+json'
try:Scripts('<script>unfinished')
except ValueError:pass
else:raise AssertionError('Unclosed script accepted')
print('PASS: script parsing handles HTML comments, style text, mixed case, quoted delimiters and malformed input.')
