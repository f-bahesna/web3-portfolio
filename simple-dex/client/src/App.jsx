import './App.css'
import { useEffect, useState } from "react"
import {initWeb3, getDexContract} from "./utils/web3config"
initWeb3();

function App() {
  const [account, setAccount] = useState("")
  const [contracts, setContracts] = useState("")
  const [web3, setWeb3] = useState(null)
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState(0)
  const [status, setStatus] = useState("");

  useEffect( () => {
    const load = async () => {
      const {web3, accounts, contracts } = await initWeb3();
      setWeb3(web3)
      setAccount(accounts[0])
      setContracts(contracts)

      const rate = await contracts.dex.methods.rate().call();
      setRate(rate);
    };
    load();
  }, []);

    const swapArbiToDoge = async () => {
      const value = web3.utils.toWei(amount, "ether")

      try {
        setStatus("Approving tokens...")
        
        await contracts.arbiFake.methods.approve(contracts.dex._address, value).send({ from: account });
        
        setStatus("Token Approved...")
      } catch (error) {
        console.error("approving failed:", error);
        setStatus("Approving failed...")
        alert("approving failed | Transaction reverted");
        resetStatus()
      }
      
      try {
        setStatus("Swapping tokens...")
        
        await contracts.dex.methods.swapArbiToDoge(value).send({ from: account });
        
        setStatus("Swap completed...")
      } catch (error) {
        console.error("Swap failed:", error);

        setStatus("Swap failed...")
        alert("swap failed | Transaction reverted");
        resetStatus()
      }

      resetStatus()
    }

    const resetStatus = async () => {
      setTimeout(() => {
        setStatus("");
      }, 5000)
    }

    return (
      <div style={{ display: "inline-block", justifyContent: "center", alignItems: "center", padding: "2rem"}}>
        <h1>Simple Dex</h1>
        <p>Connected Account: {account}</p>
        <p>1 Arbifake = {rate} DogeFake</p>
        <p>Status : { status }</p>

        <input
          type='text'
          placeholder='Amount of ArbiFake'
          value={amount}
          onChange={ (e) => setAmount(e.target.value) }
        />
        <button onClick={swapArbiToDoge}>Swab ArbiFake => DogeFake</button>
      </div>
    );
}

export default App
