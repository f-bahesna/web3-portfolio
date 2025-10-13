# 🌐 Simple Web3 Crowdfunding DApp

https://simple-crowdfunding.vercel.app/

A **decentralized crowdfunding platform** built with **Solidity**, **React**, and **Web3.js** — enabling anyone to **create** and **fund campaigns** directly on the Ethereum blockchain without intermediaries.

> Empowering creators through transparency and decentralization 🚀

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| Smart Contract | Solidity (Truffle) |
| Blockchain Network | Ethereum Sepolia Testnet |
| Frontend | React.js |
| Wallet Integration | MetaMask + Web3.js |
| Deployment | Vercel (Frontend), Infura / Alchemy (RPC Node) |

---

## ⚙️ Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (>= 16)
- [MetaMask](https://metamask.io/)
- [Git](https://git-scm.com/)
- Test ETH from a Sepolia faucet (explained below)

---

## 🪙 1. Setup MetaMask

1. Install [MetaMask Extension](https://metamask.io/download.html)
2. Create or import a wallet
3. Switch to **Sepolia Test Network**
   - Click **Network Selector → Add Network → Custom RPC**
   - **Network Name:** Sepolia Testnet  
   - **New RPC URL:** `https://sepolia.infura.io/v3/<YOUR_INFURA_PROJECT_ID>`  
   - **Chain ID:** `11155111`  
   - **Currency Symbol:** `ETH`  
   - **Block Explorer:** `https://sepolia.etherscan.io`

---

## 💧 2. Get Free Sepolia ETH (Faucet)

Visit one of these faucets and paste your MetaMask address:

| Faucet | Link |
|--------|------|
| QuickNode | [https://faucet.quicknode.com/ethereum/sepolia](https://faucet.quicknode.com/ethereum/sepolia) |
| Alchemy | [https://alchemy.com/faucets/ethereum-sepolia](https://alchemy.com/faucets/ethereum-sepolia) |
| Sepolia Faucet | [https://sepoliafaucet.com/](https://sepoliafaucet.com/) |

Wait for the transaction to confirm — your wallet should now show a small test ETH balance (e.g., `0.1 ETH`).

---

## 🧠 3. Clone and Install

```bash
git clone https://github.com/f-bahesna/simple-crowdfunding.git
cd simple-crowdfunding
cd client
npm install
