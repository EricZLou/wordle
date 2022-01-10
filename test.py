import urllib.request

url = "http://www.mieliestronk.com/corncob_caps.txt"
file = urllib.request.urlopen(url)

words = []

for line in file:
    word = line.decode("utf-8").strip()
    if len(word) == 5:
        words.append(word)

with open("words.txt", "w") as f:
    f.write(','.join(words))
