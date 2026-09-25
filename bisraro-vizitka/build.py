import subprocess
subprocess.run(['python3','make_qr.py'],check=True)
core=open('qr-core.svg').read()
open('index.html','w').write(open('design.html').read().replace('%%QR%%',core))
