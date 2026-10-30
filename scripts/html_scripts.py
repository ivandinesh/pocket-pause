"""Locate script elements with the HTML parser, preserving the surrounding bytes."""
from dataclasses import dataclass
from html.parser import HTMLParser
@dataclass
class Script:
    start:int
    end:int
    attrs:list
    body:str
class Scripts(HTMLParser):
    def __init__(self,source):
        super().__init__(convert_charrefs=False)
        self.source=source;self.scripts=[];self.active=None;self.offsets=[0]
        for line in source.splitlines(keepends=True):self.offsets.append(self.offsets[-1]+len(line))
        self.feed(source);self.close()
        if self.active is not None:raise ValueError('Unclosed script element')
    def absolute_position(self):
        line,column=self.getpos();return self.offsets[line-1]+column
    def handle_starttag(self,tag,attrs):
        if tag=='script':self.active=(self.absolute_position(),len(self.get_starttag_text()),attrs)
    def handle_endtag(self,tag):
        if tag!='script'or self.active is None:return
        start,length,attrs=self.active;close=self.absolute_position();end=self.source.index('>',close)+1
        self.scripts.append(Script(start,end,attrs,self.source[start+length:close]));self.active=None
