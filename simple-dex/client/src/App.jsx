import "./App.css";
import { useEffect, useState } from "react";
import { initWeb3 } from "./utils/web3config";
import { LuArrowLeftRight } from "react-icons/lu";

initWeb3();

function App() {
  const [account, setAccount] = useState("");
  const [contracts, setContracts] = useState("");
  const [web3, setWeb3] = useState(null);
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState({
    arbi: "0",
    doge: "0",
  });

  const isDisabled = !amount || Number(amount) <= 0;

  useEffect(() => {
    const loadAccount = async () => {
      const { web3, accounts, contracts } = await initWeb3();

      setWeb3(web3);
      setAccount(accounts[0]);
      setContracts(contracts);

      const rate = await contracts.dex.methods.rate().call();
      const arbiBalance = await contracts.arbiFake.methods
        .balanceOf(accounts[0])
        .call();
      const dogeBalance = await contracts.dogeFake.methods
        .balanceOf(accounts[0])
        .call();

      setUserBalance({
        arbi: web3.utils.fromWei(arbiBalance, "ether"),
        doge: web3.utils.fromWei(dogeBalance, "ether"),
      });
      setRate(rate);
    };

    window.ethereum.on("accountsChanged", loadAccount);

    loadAccount();
  }, []);

  const swapArbiToDoge = async () => {
    setLoading(true);
    const value = web3.utils.toWei(amount, "ether");

    try {
      setStatus("Approving tokens...");

      await contracts.arbiFake.methods
        .approve(contracts.dex._address, value)
        .send({ from: account });

      setStatus("Token Approved...");
    } catch (error) {
      setStatus("Approving failed...");
      alert("approving failed | Transaction reverted");
      resetStatus();
      setLoading(false);
      setAmount(0);
    }

    try {
      setStatus("Swapping tokens...");

      await contracts.dex.methods.swapArbiToDoge(value).send({ from: account });

      setStatus("Swap completed...");
    } catch (error) {
      setStatus("Swap failed...");
      alert("swap failed | Transaction reverted");
      resetStatus();
      setLoading(false);
      setAmount(0);
    }

    resetStatus();
    setLoading(false);
    setAmount(0);
  };

  const resetStatus = async () => {
    setTimeout(() => {
      setStatus("");
    }, 5000);
  };

  return (
    <>
      <div className="flex justify-center items-center">
        <div className="min-w-2.5 sm:w-24 sm:min-w-fit my-8 p-5 bg-black text-white border border-double rounded-md">
          <p className="truncate">Connected Account: {account}</p>
          <p>Rate : 1 Arbifake = {rate} DogeFake</p>
          <p className="py-4">You Have</p>
          <p>ArbiFake = {userBalance.arbi} AFAKE</p>
          <p>DogeFake = {userBalance.doge} DFAKE</p>
          <p className="py-3">Status : {status}</p>
          <div className="py-4">
            <input
              className="border py-2 rounded-md text-center"
              type="number"
              placeholder="Amount of ArbiFake"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button
            disabled={isDisabled || loading}
            className={isDisabled ? "opacity-25" : "opacity-100"}
            onClick={swapArbiToDoge}
          >
            {loading ? (
              "Loading..."
            ) : (
              <>
                Swap ArbiFake {<LuArrowLeftRight className="mx-auto" />}{" "}
                DogeFake
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
