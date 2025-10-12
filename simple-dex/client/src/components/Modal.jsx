import { useState } from "react";
const env = import.meta.env;
import { FaWindowClose } from "react-icons/fa";

const SIMPLE_DEX_ADDRESS = env.VITE_SIMPLE_DEX_ADDRESS;
const ARBIFAKE_ADDRESS = env.VITE_ARBIFAKE_ADDRESS;
const DOGEFAKE_ADDRESS = env.VITE_DOGEFAKE_ADDRESS;

const Modal = ({ isVisible, onClose }) => {
  if (!isVisible) return null;
  const [loading, setLoading] = useState("");

  const addTokenToWallet = async (ticker, address, id) => {
    setLoading(id);

    try {
      const added = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", //can also be 'ERC721' for NFTs
          options: {
            address: address,
            symbol: ticker,
            decimals: 18,
          },
        },
      });

      if (added) {
        console.log("Token added!");
        alert(`${ticker} successfully added to Metamask!`);
        setLoading(null);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const tokens = [
    { id: 1, title: "ArbiFake", ticker: "AFAKE", address: ARBIFAKE_ADDRESS },
    { id: 2, title: "DogeFake", ticker: "DFAKE", address: DOGEFAKE_ADDRESS },
  ];

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-md flex justify-center items-center">
      <div className="w-[600px] bg-green-300 flex flex-col">
        <div className="text-black text-xl my-2 ml-2  justify-center">
          <FaWindowClose onClick={() => onClose()} />
        </div>
        <div className="bg-[#00df9a] p-2 rounded">
          <div className="text-1xl text-black">Add token to your wallet</div>
          {tokens.map((token) => (
            <div
              key={token.id}
              className="flex justify-around items-center font-sans py-2"
            >
              <div className="text-2xl text-black">{token.title}</div>
              <button
                onClick={() =>
                  addTokenToWallet(token.ticker, token.address, token.id)
                }
              >
                {loading === token.id ? "loading..." : "Add"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modal;
