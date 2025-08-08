import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import time

def get_all_links_from_page(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        base_url = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
        links = set()

        for tag in soup.find_all("a", href=True):
            full_url = urljoin(base_url, tag['href'])
            if urlparse(full_url).netloc == urlparse(base_url).netloc:
                links.add(full_url)

        return sorted(links)
    except Exception as e:
        print(f"Error: {e}")
        return []





'''

a=get_all_links_from_page("https://www.kpriet.ac.in")


f=open("test.txt","w",encoding="utf-8")

f1,f2,f3=open("mainlink.txt","r",encoding="utf-8"),open("pdflink.txt","r",encoding="utf-8"),open("jpglink.txt","r",encoding="utf-8")
f1,f2,f3=f1.readlines(),f2.readlines(),f3.readlines()

f1.extend(f2)
f1.extend(f3)

f1=[i.strip() for i in f1]
a=[i.strip() for i in a]

a=set(a)
print(len(f1))
print(len(a))


k=a.difference(f1)
for i in list(k):
    f.write(i+"\n")
f.close()

'''