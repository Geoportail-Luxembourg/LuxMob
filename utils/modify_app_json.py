import json
import re
import sys


if len(sys.argv) < 3:
    print >> sys.stderr, 'Usage error'
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

f = open(input_file, 'r')
json_str = f.read()
f.close()

# remove comments
json_str = re.sub('(?s)/\\*.+?\\*/', '', json_str)
# remove newlines
json_str = re.sub(r'\n', '', json_str)
# take care of "\\"
json_str = json_str.encode('string-escape')

obj = json.loads(json_str)
js_list = [{'path': 'cordova-2.3.0.js'}]
js_list.extend(obj['js'])
obj['js'] = js_list

f = open(output_file, 'w')
f.write(json.dumps(obj))
f.close()
