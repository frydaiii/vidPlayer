import os
import sys
import cgi
import requests
import zipfile
import webvtt
from pyunpack import Archive

if len(sys.argv)<3:
    print('Missing download url, or destination, or both.')
    sys.exit()
else:
    try:
        url = sys.argv[1]
        dest = sys.argv[2]

        # download subtitle zip file
        res = requests.get(url)
        res.raise_for_status()
        if res.headers.get('Content-Disposition')==None:
            raise Exception('invalid url')
        zipFilename = cgi.parse_header(res.headers.get('Content-Disposition'))[-1]['filename']
        zipFilename = os.path.join(dest, zipFilename)
        zipFile = open(zipFilename, 'wb')
        for chunk in res.iter_content(chunk_size=100*1024):
            zipFile.write(chunk)
        zipFile.close()

        # extract zip file
        zipDir = zipFilename[:-4]
        if not os.path.isdir(zipDir):
            os.mkdir(zipDir)
        Archive(zipFilename).extractall(zipDir) 
        # with zipfile.ZipFile(zipFilename, 'r') as zip_ref:
        #     zip_ref.extractall(zipDir)
        
        # delete zip file
        os.remove(zipFilename)

        # get all file under srt folder
        files = []
        dirs = os.listdir(zipDir)
        while dirs:
            path = os.path.join(zipDir, dirs.pop())
            if os.path.isdir(path):
                for anotherPath in os.listdir(path):
                    dirs.append(anotherPath)
            elif os.path.isfile(path):
                files.append(path)

        # get all srt file
        srts = []
        for file in files:
            if file[-3:]=='srt': srts.append(file)

        # convert
        try:
            for srt in srts:
                webvtt.from_srt(srt).save()
        except Exception:
            for srt in srts:
                f = open(srt, 'r', encoding='utf-16')
                sub = "WEBVTT\n\n"
                for line in f:
                    temp = line[:-1]
                    if not temp.isdigit():
                        sub += line.replace(',', '.')
                f.close()

                vtt = srt.replace('.srt', '.vtt');
                f = open(vtt, 'w')
                f.write(sub)
                f.close()
    except Exception as e:
        print(e)   
