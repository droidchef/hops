import json
import sys
from pprint import pprint

with open('manifest.json' , 'r+') as manifest_file:
    manifestData = json.load(manifest_file)
    versionCode = manifestData['version'];
    if (sys.argv[1] == 'latest'):
        print 'Latest Version is %s' % versionCode
    elif(sys.argv[1] == 'releasePatch'):
        print 'Upgrading Version from 0.0.0 to 0.0.1'
    elif(sys.argv[1] == 'releaseMinor'):
        print 'Upgrading Version from 0.0.0 to 0.1.0'
    elif(sys.argv[1] == 'releaseMajor'):
        print 'Upgrading Version from 0.0.0 to 1.0.0'
