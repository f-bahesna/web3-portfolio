import Web3 from "web3";
import ArbiFake from "../../../../ArbiFake.sol/ArbiFake.json";
import DogeFake from "../../../../DogeFake.sol/DogeFake.json";
import SimpleDEX from "../../../../SimpleDEX.sol/SimpleDEX.json";
const env = import.meta.env;

let web3;
let accounts;
let contracts = {};

const SIMPLE_DEX_ADDRESS = env.VITE_SIMPLE_DEX_ADDRESS; 
const ARBIFAKE_ADDRESS = env.VITE_ARBIFAKE_ADDRESS; 
const DOGEFAKE_ADDRESS = env.VITE_DOGEFAKE_ADDRESS; 

export const initWeb3 = async () => {
    if (window.ethereum){
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        accounts = await web3.eth.getAccounts(); // get accounts
        
        // foundry dont use this
        // const networkId = (await (web3.eth.net.getId())).toString();

        const arbiFake = new web3.eth.Contract(ArbiFake.abi, ARBIFAKE_ADDRESS);
        const dogeFake = new web3.eth.Contract(DogeFake.abi, DOGEFAKE_ADDRESS);
        const dex = new web3.eth.Contract(SimpleDEX.abi, SIMPLE_DEX_ADDRESS);

        contracts = { arbiFake, dogeFake, dex };

        return { web3, accounts, contracts };
    } else {
        alert("Please install Metamask!")
    }
}

export const getDexContract = async () => {
    if(!window.ethereum) throw new Error("Metamask not found");

    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.requestAccounts();

    const dex = new web3.eth.Contract(SimpleDEX.abi, CONTRACT_ADDRESS);

    console.log("Connected with account: ", accounts[0]);
    console.log("DEX Contract:", dex);

    return { web3, dex, account: accounts[0]};
}