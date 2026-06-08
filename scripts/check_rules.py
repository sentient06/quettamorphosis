import re
import requests
from bs4 import BeautifulSoup
import json

def load_rules(url):
	response = requests.get(url)
	response.raise_for_status()

	soup = BeautifulSoup(response.text, "html.parser")

	tables = soup.find_all("table")
	# print(f"Found {len(tables)} tables")
	table = tables[-1]

	rows = table.find_all("tr")
	lang_match = re.search(r"phonetics-([a-z]+)\.html", url)

	# if lang_match is None:
		# print(f"Error: could not extract language code: {url}")

	lang_code = lang_match.group(1)

	rules = []

	for row in rows:
		cells = row.find_all("td")

		if len(cells) == 0:
			continue

		if len(cells) != 5:
			print(f"Error reading row: {len(cells)} cells, expecting 5")
			continue

		link = cells[0].find("a")

		if link is None:
			print("Error: no link found in first cell")
			continue

		href = link.get("href", "")
		match = re.search(r"word-(\d+)\.html", href)

		if match is None:
			print(f"Error: could not extract rule id from href: {href}")
			continue

		rule_id = match.group(1)

		description = cells[0].get_text(" ", strip=True)
		before = cells[1].get_text(" ", strip=True)
		arrow = cells[2].get_text(" ", strip=True)
		after = cells[3].get_text(" ", strip=True)
		order_id = cells[4].get_text(" ", strip=True)

		rule = {
			"id": rule_id,
			"description": description,
			"pattern": f"{before} {arrow} {after}",
			"orderId": order_id,
			"lang": lang_code,
		}

		rules.append(rule)
	
	return rules


urls = [
	"https://eldamo.org/content/phonetic-indexes/phonetics-p.html",
	"https://eldamo.org/content/phonetic-indexes/phonetics-at.html",
	"https://eldamo.org/content/phonetic-indexes/phonetics-os.html",
	"https://eldamo.org/content/phonetic-indexes/phonetics-s.html",
]

all_rules = []

for url in urls:
	rules = load_rules(url)
	print(f"Loaded {len(rules)} rules from {url}")
	all_rules.extend(rules)

print(f"Loaded {len(all_rules)} total rules")

rules_by_id = {}

for rule in all_rules:
	rules_by_id[rule["id"]] = rule

with open("eldamo-rules.json", "w", encoding="utf-8") as file:
	json.dump(rules_by_id, file, indent=4)

