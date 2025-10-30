# Notion Documentation Structure (Veridex)

Use a single Notion page with toggles/linked databases. Keep entries chronological: each entry = timestamp + what you did + decisions + lessons.

1) Cover + short summary
- One-liner: "Verified car NFT marketplace with escrow and gasless UX"

2) Research folder
- Problem statement
- Interviews summary (10 users) with key quotes
- Competitor table (classifieds, car history tools, crypto marketplaces)
- Key stats & references (provenance, escrow friction)

3) Design (Optional)
- Wireframes / Figma embeds (mint, list, buy, verify)
- Mockups / screenshots

4) Technical
- Tech stack (Next.js, wagmi/viem, Node/Express, Sequelize, Solidity, IPFS)
- Data model & API list (mirror `exam/FUNCTIONAL_REQUIREMENTS.md`)
- Build logs (daily): timestamp, commit/ref, changes, risks
- Prompt logs: link to `exam/PROMPT_LOG.md`
- Smart contracts addresses/ABIs (testnets) and deployment notes

5) Final demo / links / repo
- Deployed frontend URL / video demo
- Backend endpoints (if public)
- Repo link(s)

6) Reflection & next steps
- What worked, what failed, technical debt, roadmap (verification partners, fiat rails)

Prompt Log & Dev Logs (how to document)
Create a separate page or embed a table with columns:
- Timestamp
- Prompt (exact)
- Tool used (Cursor/ChatGPT/copilot/local)
- Result (code/notes)
- Action taken (accepted/modified/rejected)
- Link to commit or file

Tip: Limit to top 10 prompts for submission, highlight the most impactful.
