# 🌐 **VERIDEX — Gas-Free Asset Tokenization Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow)](https://hardhat.org/)

> Tokenize your **real-world assets** as NFTs and trade them with **zero gas fees** using Status Network and Linea zkEVM.

---

## 🧠 What is VeriDex?

**VeriDex** — это децентрализованная платформа для токенизации и торговли реальными активами без комиссий за газ.
Пользователи могут загружать документы, подтверждать владение, и выпускать **проверенные NFT-токены** своих активов.
Каждый токен — это доказательство собственности, записанное в блокчейне.
VeriDex создает новую модель доверия: активы, подтвержденные и передаваемые полностью на блокчейне.
*Made during ETH Bishkek 2025 hackathon.*

---

## 👥 Team Members

* **Aitmyrza Dastanbekov**
* **Nikita Undusk**
* **Kubatov Kairat**
* **Sultanbekov Nurbol**

---

## 🎥 Demo Video

[Watch the demo here](https://www.youtube.com/watch?v=xOW9lXJ4YCY) <!-- Replace # with your demo link -->

---

## ✨ Features

* 🏠 **Asset Tokenization** — токенизация любых активов как NFT
* ⛽ **Gas-Free Transactions** — мета-транзакции по EIP-2771
* 🔒 **Verification System** — подтверждение подлинности и владения
* 💰 **ETH-Based Marketplace** — торги за ETH без собственного токена
* 🧾 **Decentralized Registry** — владение и история активов на блокчейне
* 📱 **Responsive Interface** — современный UI, адаптивный для всех устройств
* 🌐 **Multi-Network Support** — Linea zkEVM + Status Network
* 🧑‍⚖️ **Role-Based Access** — администраторы, верификаторы, пользователи

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │ Smart Contracts │
│   (Next.js)     │    │   (Node.js)     │    │   (Solidity)    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Wagmi + Viem  │    │ • Express API   │    │ • AssetNFT      │
│ • RainbowKit    │◄──►│ • PostgreSQL    │◄──►│ • Marketplace   │
│ • TailwindCSS   │    │ • IPFS/Pinata   │    │ • Escrow        │
│ • React Query   │    │ • Redis Cache   │    │ • Gasless Relayer│
│ • Meta-Tx UX    │    │ • Oracle Layer  │    │ • Ownership Proof│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Num1s/VeriDex
cd VeriDex
npm install
```

### 2. Smart Contracts

```bash
cd smart-contracts
npm install
npm run compile
npm test
npm run deploy:localhost
```

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run dev
```

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Then open 👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📁 Project Structure

```
VeriDex/
├── smart-contracts/
│   ├── contracts/       # Solidity contracts
│   ├── scripts/         # Deployment
│   ├── test/            # Tests
│   └── hardhat.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── modules/
│   │   ├── database/
│   │   └── utils/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
└── docs/
    ├── architecture.md
    ├── gasless.md
    └── api.md
```

---

## 💡 How It Works

### 1. Tokenize Your Asset

1. Подключи Web3-кошелек
2. Введи данные актива (VIN / ID / описание)
3. Загрузите документы и фото
4. Отправьте запрос на выпуск **gas-free NFT**
5. Токен создается и ожидает верификации

### 2. Verification Process

1. Верификатор проверяет документы и данные
2. Сравнение с базами данных / API
3. Подтверждение или отклонение
4. После одобрения актив становится **verified**

### 3. Marketplace Trading

1. Размести актив с ценой в ETH
2. Покупатель оплачивает через escrow
3. Платформа обеспечивает безопасный перевод
4. Все транзакции **без газа**, с прозрачной историей
5. Комиссия платформы — 2%

### 4. Gasless Flow ⚡

1. Пользователь подписывает намерение транзакции
2. **Relayer** отправляет его в блокчейн
3. Платформа оплачивает газ
4. Контракт выполняет действие
5. Пользователь получает подтверждение без затрат

---

## 🛠️ Tech Stack

**Blockchain**

* Solidity, Hardhat, OpenZeppelin, EIP-2771

**Backend**

* Node.js, Express, PostgreSQL, Redis, IPFS (Pinata), Ethers.js

**Frontend**

* Next.js, TypeScript, Wagmi, RainbowKit, TailwindCSS, React Query

**Infrastructure**

* Linea zkEVM, Status Network, Vercel, Docker, Pinata

---

## 📊 Economics

### Platform Fee

```
2% per transaction
├── Marketplace Fee: 2%
├── Gas Coverage: paid by platform
└── Treasury: automatic collection
```

### Comparison

| Action    | Traditional Web3 | VeriDex |
| --------- | ---------------- | ------- |
| Mint NFT  | $5–20 gas        | $0      |
| List Item | $3–15 gas        | $0      |
| Purchase  | $5–25 gas        | $0      |
| **Total** | **$13–60**       | **$0**  |

---

## 🔐 Security

**Smart Contracts**

* Role-based access
* Reentrancy guard
* Input validation
* Audited OpenZeppelin libraries

**Backend**

* Rate limiting
* SQL injection protection
* JWT auth
* CORS & HTTPS enforced

**Frontend**

* Wallet-safe UX
* Client-side validation
* CSP & XSS protection

---

## 🌐 Networks

| Network          | Chain ID | Status     | Purpose               |
| ---------------- | -------- | ---------- | --------------------- |
| Linea Testnet    | 59140    | ✅          | Main test environment |
| Status Network   | 1946     | ✅          | Gasless layer         |
| Hardhat Local    | 31337    | ✅          | Development           |
| Ethereum Mainnet | 1        | 🔄 Planned |                       |
| Linea Mainnet    | 59144    | 🔄 Planned |                       |

---

## 📚 Docs

* [Architecture Overview](docs/architecture.md)
* [Gasless Transactions](docs/gasless.md)
* [API Reference](docs/api.md)
* [Deployment Guide](docs/deployment.md)

---

## 🧪 Testing

```bash
cd smart-contracts
npm test
npm run coverage
```

```bash
cd backend
npm test
npm run test:coverage
```

```bash
cd frontend
npm run lint
npm run type-check
```

---

## 🚀 Deployment

1. `npx hardhat node`
2. `npm run deploy:localhost`
3. `npm run dev` (backend)
4. `npm run dev` (frontend)
   → [http://localhost:3000](http://localhost:3000)

**Testnet:**
`npm run deploy:linea` → update addresses → deploy to Vercel

---

## 🤝 Contributing

1. Fork → Clone → Install
2. Make changes
3. Run tests
4. Submit PR

Focus areas:

* 🐞 Bug fixes
* 🧪 Tests
* 🎨 UI/UX
* 📚 Docs

---

## 📄 License

Licensed under the **MIT License**. See [LICENSE](LICENSE).

---

**Built with ❤️ at ETH Bishkek 2025**
**VeriDex — Verified Value. Digital Ownership. Zero Gas.**
