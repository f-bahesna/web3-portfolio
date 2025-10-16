import "./App.css";
import { useEffect, useState } from "react";
import { initWeb3 } from "./utils/web3config";
import { LuArrowLeftRight } from "react-icons/lu";
import { RiArrowDropDownLine } from "react-icons/ri";

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

  const [isMax, setIsMax] = useState(false);

  const isDisabled = !amount || Number(amount) <= 0;

  useEffect(async () => {
    window.ethereum.on("accountsChanged", loadAccount);

    const rate = await contracts.dex.methods.rate().call();
    setRate(rate);

    loadAccount();
  }, []);

  const loadAccount = async () => {
    const { web3, accounts, contracts } = await initWeb3();

    setWeb3(web3);
    setAccount(accounts[0]);
    setContracts(contracts);

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

    localStorage.setItem("account", accounts[0]);
  };

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

  const setMaxTopAmountSwap = () => {
    setAmount(userBalance.arbi);
    setIsMax(true);
  };

  const setManualTopAmountSwap = (e) => {
    const value = e.target.value;
    setAmount(value);
    setIsMax(false);
  };

  return (
    <>
      <div className="flex justify-center items-center">
        <div className="min-w-2.5 sm:w-1/2 my-12 p-0.5 bg-black text-white border rounded-3xl">
          <div className="flex flex-col gap-4 text-md text-foreground bg-zinc-800 rounded-3xl">
            <div className="px-4 py-2">
              {/* top */}
              <div className="flex flex-row justify-between font-mono">
                <p>Selling</p>
                <div className="font-mono text-md">
                  {userBalance.arbi}
                  <span onClick={setMaxTopAmountSwap} className="px-1">
                    <a href="#">Max</a>
                  </span>
                </div>
              </div>
              {/* end top */}
              {/* center */}
              <div className="flex flex-row items-center justify-between rounded-md py-2">
                <input
                  className="w-2/3 font-mono bg-transparent text-3xl placeholder:text-3xl focus:outline-none rounded-md bg-zinc-800 py-2"
                  type="number"
                  value={amount}
                  onChange={setManualTopAmountSwap}
                  placeholder="0.0001"
                />
                <div className="text-white cursor-pointer font-sans text-2xl">
                  ArbiFake
                </div>
                <div className="text-4xl cursor-pointer">
                  <RiArrowDropDownLine />
                </div>
              </div>
              {/* end center */}
              <div className="flex flex-row justify-start font-light">
                $0.001
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-md text-foreground bg-black rounded-3xl">
            <div className="px-4 py-2">
              {/* top */}
              <div className="flex flex-row justify-between font-mono">
                <p>Buying</p>
                <div className="font-mono text-md">0.0001</div>
              </div>
              {/* end top */}
              {/* center */}
              <div className="flex flex-row items-center justify-between rounded-md py-2">
                <input
                  disabled
                  className="w-2/3 font-mono bg-transparent placeholder:text-2xl rounded-md bg-black py-2"
                  type="number"
                  placeholder="0.0001"
                />
                <div className="text-white cursor-pointer font-sans text-2xl">
                  DogeFake
                </div>
                <div className="text-4xl cursor-pointer">
                  <RiArrowDropDownLine />
                </div>
              </div>
              {/* end center */}
              <div className="flex flex-row justify-start font-light">
                $0.001
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div
          onClick={!isDisabled ? swapArbiToDoge : undefined}
          className={`bg-[#3dad8a] hover:bg-[#47cfa4] transition-colors duration-300 text-2xl rounded-2xl w-full sm:w-1/2 cursor-pointer ${
            isDisabled ? "opacity-25 pointer-events-none" : "opacity-100"
          }`}
        >
          <button
            disabled={isDisabled || loading}
            className={`w-full py-3 rounded-md text-white `}
          >
            {loading ? "Processing..." : <>Swap</>}
          </button>
        </div>
      </div>
    </>
  );
}

export default App;

{
  /* <p className="truncate">Connected Account: {account}</p>
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
            /> */
}
