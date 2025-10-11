import Web3 from "web3"
import Crowdfunding from "../../../smart-contract/build/contracts/Crowdfunding.json"

let web3;
let contract;
let selectedAccount;

export const initWeb3 = async () => {
    if (window.ethereum){
        web3 = new Web3(window.ethereum)
        await window.ethereum.request({ method: "eth_requestAccounts"});

        const networkId = (await (web3.eth.net.getId())).toString();
    
        const deployedNetwork = Crowdfunding.networks[networkId];

        contract = new web3.eth.Contract(
            Crowdfunding.abi,
            deployedNetwork && deployedNetwork.address
        );

        const accounts = await web3.eth.getAccounts();
        selectedAccount = accounts[0];

        return { web3, contract, selectedAccount };
    } else {
        alert("Please install MetaMask!");
    }
};