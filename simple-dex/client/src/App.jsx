import "./App.css";
import { useEffect, useState } from "react";
import { initWeb3, TOKENS } from "./utils/web3config";
import { LuArrowLeftRight } from "react-icons/lu";
import { RiArrowDropDownLine } from "react-icons/ri";
import ModalSelectToken from "./components/ModalSelectToken";
import Navbar from "./Navbar.jsx";

initWeb3();

function App() {
  const [account, setAccount] = useState(null);
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

  const [showModalSelectToken, SetShowModalSelectToken] = useState(false);
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);

  const [isMax, setIsMax] = useState(false);

  const isDisabled = !amount || Number(amount) <= 0;

  useEffect(() => {
    let localAccount = localStorage.getItem("account");

    if (localAccount !== null) {
      if (window.ethereum) {
        loadAccount();
        window.ethereum.on("accountsChanged", loadAccount);
      } else {
        localStorage.removeItem("account");
        setAccount(null);
      }
    }
  }, [selectedToken]);

  const loadAccount = async () => {
    const { web3, accounts, contracts } = await initWeb3();

    setWeb3(web3);
    setAccount(accounts[0]);
    setContracts(contracts);
    setLoading(true);

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

    const rate = await contracts.dex.methods.rate().call();
    setRate(rate);

    localStorage.setItem("account", accounts[0]);
    setLoading(false);
  };

  const resetStatus = async () => {
    setTimeout(() => {
      setStatus("");
    }, 5000);
  };

  const disconnectAccount = async () => {
    localStorage.removeItem("account");
    setAccount(null);
  };

  //SWAP FUNCTION
  const swapArbiToDoge = async () => {
    if (selectedToken.ticker === "DFAKE") {
      alert("The pair still in maintenance");
      return;
    }

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
      return;
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

  const setMaxAmountSwap = () => {
    setAmount(
      selectedToken.ticker === "AFAKE" ? userBalance.arbi : userBalance.doge
    );
    setIsMax(true);
  };

  const setManualAmountSwap = (e) => {
    let value = e.target.value;

    if (selectedToken.ticker === "AFAKE") {
      if (Number(value) > Number(userBalance.arbi)) {
        alert("Insufficient Balance");
        value = "";
      }
    }

    if (selectedToken.ticker === "DFAKE") {
      if (Number(value) > Number(userBalance.doge)) {
        alert("Insufficient Balance");
        value = "";
      }
    }

    setAmount(value);
    setIsMax(false);
  };

  const handleSelectedToken = (tokenId) => {
    const findTokenById = TOKENS.find((token) => token.id === Number(tokenId));
    setSelectedToken(findTokenById);
    if (isMax) {
      setAmount(
        findTokenById.ticker === "AFAKE" ? userBalance.arbi : userBalance.doge
      );
    }

    SetShowModalSelectToken(false);
  };

  return (
    <>
      <Navbar account={account} disconnectAccount={disconnectAccount} />

      {account ? (
        <div>
          <div className="flex justify-center items-center">
            <div className="min-w-2.5 sm:w-4/5 md:w-1/2 my-12 p-1.5 bg-black text-white border rounded-3xl">
              <div className="flex flex-col gap-4 text-md text-foreground bg-zinc-800 rounded-2xl">
                <div className="px-4 py-2">
                  {/* top */}
                  <div className="flex flex-row justify-between font-mono">
                    <p>Selling</p>
                    <div className="font-mono text-md">
                      {selectedToken.ticker === "AFAKE"
                        ? userBalance.arbi
                        : userBalance.doge}
                      <span onClick={setMaxAmountSwap} className="px-1">
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
                      onChange={setManualAmountSwap}
                      placeholder="0.0001"
                    />
                    <div
                      onClick={() => {
                        SetShowModalSelectToken(true);
                      }}
                      className="text-white cursor-pointer font-sans text-2xl"
                    >
                      {selectedToken.label}
                    </div>
                    <div
                      onClick={() => {
                        SetShowModalSelectToken(true);
                      }}
                      className="text-4xl cursor-pointer"
                    >
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
                      className="w-2/3 font-mono bg-transparent text-3xl placeholder:text-2xl rounded-md bg-black py-2"
                      value={amount * Number(rate)}
                      type="number"
                      placeholder="0.0001"
                    />
                    <div className="text-white font-sans text-2xl">
                      {selectedToken.pairs[0].label}
                    </div>
                    <div className="text-4xl mr-8">
                      {/* <RiArrowDropDownLine /> */}
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
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <button
            onClick={loadAccount}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-400 rounded-lg text-black capitalize"
          >
            {loading ? <>Connecting...</> : <>Connect Metamask</>}
          </button>
        </div>
      )}

      <ModalSelectToken
        isVisible={showModalSelectToken}
        onClose={() => SetShowModalSelectToken(false)}
        baseTokens={TOKENS}
        onDataSend={handleSelectedToken}
        selectedToken={selectedToken}
      />
    </>
  );
}

export default App;
