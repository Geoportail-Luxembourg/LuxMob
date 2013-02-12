import json
import re
import sys
import shutil


if len(sys.argv) < 2:
    print >> sys.stderr, 'Usage error'
    sys.exit(1)

cordova = sys.argv[1]

f = shutil.copyfile('app.json', 'app.json.bak')

f = open('app.json', 'r')
json_str = f.read()
f.close()

# remove comments
json_str = re.sub('(?s)/\\*.+?\\*/', '', json_str)
# remove newlines
json_str = re.sub(r'\n', '', json_str)
# take care of "\\"
json_str = json_str.encode('string-escape')

obj = json.loads(json_str)
obj['js'].insert(1, {'path': cordova, 'type': 'js'})

f = open('app.json', 'w')
f.write(json.dumps(obj))
f.close()
