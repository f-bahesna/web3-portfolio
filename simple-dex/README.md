---

## 🦄 Simple DEX — Token Swap dApp

https://simple-dex-lime.vercel.app/

A minimal decentralized exchange (DEX) that allows users to **swap between two ERC-20 tokens** directly on-chain.
Built using **Solidity**, **Foundry**, and a **React + Vite** frontend connected via **Web3.js**.

---

## 📘 Introduction

**Simple DEX** demonstrates how decentralized exchanges work at the core:

* Users can **swap between two tokens** (e.g., ArbiFake ↔ DogeFake).
* The DEX holds token reserves to facilitate swaps.
* Swap rates are determined by a fixed ratio set during deployment.

This project is perfect for learning **smart contract interaction**, **liquidity pools**, and **frontend integration** using **Foundry** instead of Truffle.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/simple-dex.git
cd simple-dex
```

### 2. Install dependencies

#### Backend (Foundry)

```bash
cd smart_contract
forge install
```

#### Frontend

```bash
cd ../client
npm install
```

### 3. Configure environment

Create a `.env` file inside the **client** folder:

```bash
VITE_SIMPLE_DEX_ADDRESS=0xYourDeployedContractAddress
VITE_ARBI_FAKE_ADDRESS=0xTokenAAddress
VITE_DOGE_FAKE_ADDRESS=0xTokenBAddress
VITE_NETWORK=sepolia
```

---

## 🚀 How to Use

### 🧩 Deploy Smart Contracts

Inside `smart_contract/`:

```bash
forge script script/DeploySimpleDEX.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

> Make sure `.env` in smart_contract includes:
>
> ```
> SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<your-key>
> PRIVATE_KEY=0x<your-private-key>
> ```

### 🪙 Add Liquidity

Before swapping, the DEX must have both tokens:

* Send some **ArbiFake** and **DogeFake** tokens to your deployed DEX address (via MetaMask or script).

### 💱 Swap Tokens

Start the React app:

```bash
cd client
npm run dev
```

Then:

1. Connect MetaMask to **Sepolia testnet**
2. Input amount in the swap form
3. Click **Swap**
4. Confirm the transaction in MetaMask
5. You’ll see alerts for success or failure in the UI

---

## 🧠 Project Structure

```
simple-dex/
│
├── client/               # React + Vite frontend
│   ├── src/
│   ├── .env
│   └── package.json
│
├── smart_contract/       # Foundry smart contracts
│   ├── src/
│   │   ├── ArbiFake.sol
│   │   ├── DogeFake.sol
│   │   └── SimpleDEX.sol
│   ├── script/
│   │   └── DeploySimpleDEX.s.sol
│   ├── foundry.toml
│   └── .env
│
└── README.md
```

---

## 🧪 Testing with Foundry

```bash
forge test
```

---

## 🧰 Tech Stack

| Layer                  | Tools                           |
| ---------------------- | ------------------------------- |
| Smart Contract         | Solidity, OpenZeppelin, Foundry |
| Frontend               | React + Vite                    |
| Blockchain Interaction | Web3.js                         |
| Network                | Ethereum Sepolia Testnet        |

---

## 💡 Future Improvements

* Enhance UI (like uniswap etc).
* Add **dynamic price ratio** (AMM-like formula).
* Add **liquidity pool tracking** and **rewards**.
* Integrate **TheGraph** for transaction analytics.

---

## 🧑‍💻 Author

**Frada Bahesna**
Backend Engineer & Web3 Enthusiast
📫 Connect: [GitHub](https://github.com/f-bahesna)
