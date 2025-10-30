# Functional Requirements / Technical Assignment

Project title: Veridex — verified car NFT marketplace with escrow and gasless UX

1. Vision (1–2 lines)
Enable trusted, low-friction peer‑to‑peer vehicle sales by combining verification signals, programmable escrow, and NFT‑based ownership with optional gasless interactions.

2. Core features (MVP)
- Wallet registration and auth (EOA + signature) — Priority: High — Acceptance: User connects wallet and session is established; protected routes require auth.
- Mint car NFT with metadata (IPFS) — High — Acceptance: User can mint a Car NFT with make/model/year/mileage/media; tokenURI resolves; metadata schema validated.
- Listing creation (fixed price) — High — Acceptance: Owner lists NFT with price; listing visible in marketplace; only owner can list/unlist.
- Escrowed purchase — High — Acceptance: Buyer can commit funds; contract holds funds and transfers NFT upon settlement; unhappy paths (cancel/expire) handled.
- Verification badge workflow — Medium — Acceptance: Admin/verifier updates verification state; UI displays badge; events emitted on chain and reflected in listing detail.
- Gasless meta‑transactions — Medium — Acceptance: Selected actions (e.g., listing/cancel, verification update) can be relayed; user signs; relayer pays gas; on‑chain attribution preserved.
- Profile & portfolio — Medium — Acceptance: User sees owned cars, active listings, and purchases; pagination works.
- Admin verify panel — Medium — Acceptance: Admin can review submissions and toggle verification; audit trail recorded.

3. Non-functional
- Security: Role‑gated admin functions; reentrancy protection; input validation; minimum approvals on relayer.
- Privacy: Minimize PII; store public-safe metadata; allow delinking sensitive artifacts or storing off‑chain.
- Performance: Marketplace loads listings < 2s (p95) on broadband; contract interactions confirm within network norms.
- Reliability: Relayer retriable; IPFS pinning with redundancy; backend rate limiting.
- Usability: Clear statuses (listed/escrowed/sold), verification badge semantics, responsive UI.

4. API / Data model (backend)
- Users: { id, walletAddress, role, createdAt }
- Cars: { id, tokenId, ownerAddress, metadataUri, make, model, year, mileage, images[] }
- Listings: { id, tokenId, seller, price, status, createdAt }
- Verifications: { id, tokenId, status: "unverified"|"pending"|"verified", reviewer, notes, updatedAt }
- Transactions: { id, listingId, buyer, txHash, status: "initiated"|"settled"|"refunded", createdAt }

5. Acceptance tests (samples)
- Given a connected wallet owning token X, when creating a listing at price P, then listing appears and only that owner can cancel.
- Given a listing at price P, when buyer commits funds, then escrow holds funds; if verification=required and becomes verified, then NFT transfers to buyer and seller receives funds.
- Given admin role, when verification is set to verified, then UI displays a badge and an event is recorded.
- Given relayer enabled, when user signs meta‑tx for listing cancel, then transaction is executed on chain with relayer paying gas and attribution preserved.
