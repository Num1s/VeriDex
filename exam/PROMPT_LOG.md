# Prompt Log (Template + Examples)

Columns: Timestamp | Prompt (exact) | Tool used | Result | Action taken | Link

Keep the top 10 prompts for submission. Highlight the most impactful.

## Template Row
YYYY-MM-DD HH:MM | "<exact prompt>" | Cursor/ChatGPT/Copilot | <summary> | accepted/modified/rejected | <commit/file link>

## Example Prompts (Adapted to Veridex)
1. "Generate a Next.js (App Router) scaffold for a marketplace with pages: marketplace, mint, profile; integrate wagmi + viem + RainbowKit."
2. "Write a Solidity `CarNFT` contract (ERC721) with metadata URI and role-based minter; include OpenZeppelin imports. Show code only."
3. "Create a `Marketplace` Solidity contract supporting fixed-price listings and escrowed purchases with cancel/expire flows."
4. "Implement a Node/Express route to create a listing in the database and emit an on-chain transaction via viem; include validation."
5. "Write a React component `CreateListingModal` with form validation and submission to backend; integrate wallet address as seller."
6. "Provide a relayer service pattern for gasless meta-transactions using EIP-712 signatures; include verification on-chain."
7. "Add an admin verification panel in Next.js to toggle verification status for a tokenId; protect via middleware."
8. "Write unit tests for `Escrow` unhappy paths (cancel before settle, refund on expire) using Hardhat + chai."
9. "Create a Sequelize model for Listings and Verifications with associations; include migration files."
10. "Draft a README section explaining environment variables, IPFS pinning, and how to run contracts + frontend locally."
