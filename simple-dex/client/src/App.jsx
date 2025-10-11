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
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState({
    arbi: "0",
    doge: "0"
  })

  const isDisabled = !amount || Number(amount) <= 0;

  useEffect(() => {
    const load = async () => {
      const {web3, accounts, contracts } = await initWeb3();
      setWeb3(web3)
      setAccount(accounts[0])
      setContracts(contracts)
      const rate = await contracts.dex.methods.rate().call();
      const arbiBalance = await contracts.arbiFake.methods.balanceOf(accounts[0]).call();
      const dogeBalance = await contracts.dogeFake.methods.balanceOf(accounts[0]).call();

      setUserBalance({
          arbi: web3.utils.fromWei(arbiBalance, "ether"),
          doge: web3.utils.fromWei(dogeBalance, "ether")
        })
      setRate(rate);
    };

    load();
  }, []);

    const swapArbiToDoge = async () => {
      setLoading(true)
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
        setLoading(false)
        setAmount(0)
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
        setLoading(false)
        setAmount(0)
      }

      resetStatus()
      setLoading(false)
      setAmount(0)
    }

    const resetStatus = async () => {
      setTimeout(() => {
        setStatus("");
      }, 5000)
    }

    return (
      <div className='my-8 p-8 bg-black text-white border border-double rounded-md'>
        <p>Connected Account: {account}</p>
        <p>Rate : 1 Arbifake = {rate} DogeFake</p>
        
        <p className='py-4'>You Have</p>
        <p>ArbiFake = {userBalance.arbi} AFAKE</p>
        <p>DogeFake = {userBalance.doge} DFAKE</p>
        <p className='py-3'>Status : { status }</p>
        <div className='py-4'>
          <input
            className='border py-2 rounded-md text-center'
            type='number'
            placeholder='Amount of ArbiFake'
            value={amount}
            onChange={ (e) => setAmount(e.target.value) }
          />
        </div>
          <button disabled={isDisabled || loading} className={isDisabled ? "opacity-25": "opacity-100"} onClick={swapArbiToDoge}>{loading ? 'Loading...' : 'Swap ArbiFake to DogeFake'}</button>
      </div>
    );
}

export default App
