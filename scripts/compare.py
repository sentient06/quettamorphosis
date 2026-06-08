import json

def load_json(path):
    with open(path, encoding="utf-8") as file:
        return json.load(file)

eldamo_rules = load_json("eldamo-rules.json")
quetta_rules = load_json("quettamorphosis-rules.json")

eldamo_ids = set(eldamo_rules.keys())
quetta_ids = set(quetta_rules.keys())

new_rules = eldamo_ids - quetta_ids
removed_rules = quetta_ids - eldamo_ids
common_rules = eldamo_ids & quetta_ids

order_changed = []
pattern_changed = []
description_changed = []

for rule_id in common_rules:
  eldamo = eldamo_rules[rule_id]
  quetta = quetta_rules[rule_id]

  order_e = eldamo.get("orderId")
  order_q = quetta.get("orderId")

  if order_e != "" and order_e != order_q:
      order_changed.append(rule_id)
      # print(f"\n - Order changed: E: {order_e} Q: {order_q}")

  if eldamo.get("pattern") != quetta.get("pattern"):
      pattern_changed.append(rule_id)

  if eldamo.get("description") != quetta.get("description"):
      description_changed.append(rule_id)

print(f"New rules: {len(new_rules)}")
for rule_id in sorted(new_rules):
    print(rule_id, eldamo_rules[rule_id])

print(f"\nRemoved rules: {len(removed_rules)}")
for rule_id in sorted(removed_rules):
    print(rule_id, quetta_rules[rule_id])

print(f"\nOrder changed: {len(order_changed)}")
for rule_id in sorted(order_changed):
    print(rule_id, eldamo_rules[rule_id].get("lang"))
    print("  Eldamo:", eldamo_rules[rule_id].get("orderId"))
    print("  Quetta:", quetta_rules[rule_id].get("orderId"))

print(f"\nPattern changed: {len(pattern_changed)}")
for rule_id in sorted(pattern_changed):
    print(rule_id, eldamo_rules[rule_id].get("lang"))
    print("  Eldamo:", eldamo_rules[rule_id].get("pattern"))
    print("  Quetta:", quetta_rules[rule_id].get("pattern"))

print(f"\nDescription changed: {len(description_changed)}")
for rule_id in sorted(description_changed):
    print(rule_id, eldamo_rules[rule_id].get("lang"))
    print("  Eldamo:", eldamo_rules[rule_id].get("description"))
    print("  Quetta:", quetta_rules[rule_id].get("description"))