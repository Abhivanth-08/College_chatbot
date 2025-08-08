import os
import requests
import urllib.parse


def download_file(url, base_folder='files'):

    parsed = urllib.parse.urlparse(url)
    encoded_path = urllib.parse.quote(parsed.path)

    encoded_url = f"{parsed.scheme}://{parsed.netloc}{encoded_path}"

    filename = os.path.basename(encoded_path)
    filename = filename.replace(" ", "_")

    ext = os.path.splitext(filename)[1].lower()
    if ext not in ['.pdf', '.jpg', '.jpeg']:
        print(f"❌ Skipped unsupported file type: {filename}")
        return None, None

    file_type = 'pdf' if ext == '.pdf' else 'jpg'
    folder = os.path.join(base_folder, file_type)
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, filename)

    try:
        response = requests.get(encoded_url)
        if response.status_code == 200 and response.content.startswith(b'%PDF'):
            with open(path, 'wb') as f:
                f.write(response.content)
            print(f"✅ Downloaded: {filename}")
            return path, file_type
        else:
            print(f"❌ Failed: {url} ({response.status_code})")
    except Exception as e:
        print(f"❌ Error downloading {url}: {e}")

    return None, None


'''
f=open("sublinks.txt","r",encoding="utf-8")
k=f.readlines()
l=[]
m=[]
c=0
d=0

f1=open("pdflink.txt","w",encoding="utf-8")
f2=open("jpglink.txt","w",encoding="utf-8")
f3=open("mainlink.txt","w",encoding="utf-8")

for i in k:
    if ".pdf" in i:
        c+=1
        l.append(i)
        k.remove(i)
    if ".jpg" in i:
        d+=1
        m.append(i)
        k.remove(i)

f1.writelines(l)
f2.writelines(m)
f3.writelines(k)

f1.close()
f2.close()
f3.close()

print(c)
print(d)
print(len(k))


f=open("test.txt","r")
f=f.readlines()
for i in f:
    print(download_file(i,"pdf_jpg_test"))

'''


'''f=open("sublinks.txt","r",encoding="utf-8")

f1=open("mainlink.txt","w",encoding="utf-8")

p=f.readlines()

for i in p:
    if ".png" not in i and ".jpg" not in i and ".webp" not in i and ".pdf" not in i:
        f1.write(i)

f1.close()'''

f="pdf_jpg"

k=open("pdflink.txt","r",encoding="utf-8")
k=k.readlines()
c=1
for i in k:
    print(c)
    download_file(i,f)
    c+=1


