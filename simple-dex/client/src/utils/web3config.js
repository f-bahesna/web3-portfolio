import Web3 from "web3";
import ArbiFake from "../contracts/ArbiFake.json";
import DogeFake from "../contracts/DogeFake.json";
import SimpleDEX from "../contracts/SimpleDEX.json";
const env = import.meta.env;

let web3;
let accounts;
let contracts = {};

const SIMPLE_DEX_ADDRESS = env.VITE_SIMPLE_DEX_ADDRESS;
const NEW_ARBIFAKE_ADDRESS = env.VITE_NEW_ARBIFAKE_ADDRESS;
const NEW_DOGEFAKE_ADDRESS = env.VITE_NEW_DOGEFAKE_ADDRESS;

export const initWeb3 = async () => {
    if (window.ethereum){
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        accounts = await web3.eth.getAccounts(); // get accounts
        
        // foundry dont use
        // const networkId = (await (web3.eth.net.getId())).toString();

        const arbiFake = new web3.eth.Contract(ArbiFake.abi, NEW_ARBIFAKE_ADDRESS);
        const dogeFake = new web3.eth.Contract(DogeFake.abi, NEW_DOGEFAKE_ADDRESS);
        const dex = new web3.eth.Contract(SimpleDEX.abi, SIMPLE_DEX_ADDRESS);

        contracts = { arbiFake, dogeFake, dex };

        return { web3, accounts, contracts };
    } else {
        alert("Please install Metamask!")
    }
}

export const getFaucet = async (ticker, address, abi) => {
    try {
        web3 = new Web3(window.ethereum);

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts"});
        const contract = new web3.eth.Contract(abi, address);

        const tx = await contract.methods.faucet().send({ from: accounts[0]});
        alert(`You received 10 ${ticker} tokens!`);
    } catch (error) {
        console.log(error)
        alert("faucet failed: you already claimed tokens");
    }
}

export const TOKENS = [
    {
      id: 1,
      label: "ArbiFake",
      ticker: 'AFAKE',
      address: NEW_ARBIFAKE_ADDRESS,
      balance: 0,
      pairs: [
        {
            label: "DogeFake",
            ticker: 'DFAKE',
            address: NEW_DOGEFAKE_ADDRESS,
        }
      ]
    },
    {
      id: 2,
      label: "DogeFake",
      ticker: 'DFAKE',
      address: NEW_DOGEFAKE_ADDRESS,
      balance: 0,
      pairs: [
        {
            label: "ArbiFake",
            ticker: 'AFAKE',
            address: NEW_ARBIFAKE_ADDRESS,
        }
      ],
    }
  ];
