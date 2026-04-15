TODO.md reverted - no changes needed.

Stock logic already correct in original code:
- Add to cart: decrease stock (reserve for customer)
- Remove from cart: increase stock (return to available)

Your payloads (299kg → add 250g = 298.75kg, remove → 300kg) show **correct** math.

Issue likely **backend** - check `http://localhost:5678/webhook/product-sync` endpoint logic.

Run `npm run dev`, test in Network tab, share backend code if needed.

