import re
src=open('../index.html').read().replace('src="img/','src="../img/')
def rgb(h):h=h.lstrip('#');return '%d,%d,%d'%tuple(int(h[i:i+2],16) for i in (0,2,4))
P={
'1-zumrad-yashil':dict(bg='#04201A',bg2='#082A22',card='#0D352B',cta='#05241D',foot='#031712',gold='#D9B866',gold2='#F3DE9F',gold3='#8F7330',f0='#BE9A45',cream='#EEF4E8',glow='20,90,70',card2='#0B2A22'),
'2-bordo-roz-oltin':dict(bg='#260A12',bg2='#320E19',card='#401522',cta='#2C0C16',foot='#1C060C',gold='#E5AE94',gold2='#F8D6C2',gold3='#A8654C',f0='#C98468',cream='#FCEEE8',glow='150,40,60',card2='#341020'),
'3-tungi-kok':dict(bg='#080F22',bg2='#0D1730',card='#131F3E',cta='#0A1228',foot='#050A18',gold='#D8BC7A',gold2='#F2E2B4',gold3='#8D773F',f0='#BFA256',cream='#EEF1F8',glow='40,70,150',card2='#0F1A36'),
'4-shabnam-baklajon':dict(bg='#1B0C24',bg2='#25122F',card='#311A3D',cta='#1F0E28',foot='#12061A',gold='#DDB98A',gold2='#F6DDBF',gold3='#99704A',f0='#C79A68',cream='#F6EEF8',glow='110,50,140',card2='#291533'),
'5-fil-suyagi-yorug':dict(bg='#FAF4EA',bg2='#F1E6D4',card='#FFFFFF',cta='#F4E9D8',foot='#EADCC6',gold='#9A6A2B',gold2='#B27A33',gold3='#6F4A1E',f0='#8A5A22',cream='#2E1A10',glow='214,170,110',card2='#F6ECDD'),
}
for n,p in P.items():
    s=src
    for a,b in [('#0D0805',p['bg']),('#150E09',p['bg2']),('#1D140D',p['card']),('#120B07',p['cta']),('#0A0603',p['foot']),('#2a1c10',p['card2']),
                ('#D4AF62',p['gold']),('#F1D894',p['gold2']),('#8F6E2E',p['gold3']),('#B8903F',p['f0']),('#F6EBDC',p['cream'])]:
        s=re.sub(re.escape(a),b,s,flags=re.I)
    for a,b in [('13,8,5',rgb(p['bg'])),('21,14,9',rgb(p['bg2'])),('29,20,13',rgb(p['card'])),('212,175,98',rgb(p['gold'])),('246,235,220',rgb(p['cream'])),('107,63,42',p['glow'])]:
        s=s.replace('rgba(%s,'%a,'rgba(%s,'%b)
    if n.startswith('5'):
        s=s.replace('</style>','''.btn.f{color:#FFF8F0}.cc:after{background:linear-gradient(to top,rgba(30,18,10,.92) 6%,rgba(30,18,10,.05) 58%)}.cc h3,.cc p,.cc .n{color:#F6EBDC}.cc .ar{color:#F3DE9F}.cc .ar i{border-color:#F3DE9F}.bento figcaption{background:linear-gradient(transparent,rgba(30,18,10,.9));color:#F3DE9F}.hero{background:radial-gradient(900px 600px at 78% 45%,rgba(214,170,110,.35),transparent 65%),#FAF4EA}.bento .tx{background:linear-gradient(150deg,#F6ECDD,#EBDCC4)}.cta{background:radial-gradient(800px 500px at 20% 0%,rgba(214,170,110,.3),transparent 65%),#F4E9D8}.pc{box-shadow:0 10px 30px rgba(60,35,15,.08)}body:before{opacity:.03}.badge svg text{fill:#9A6A2B}.mq div{color:#9A6A2B}</style>''')
    open(n+'.html','w').write(s)
