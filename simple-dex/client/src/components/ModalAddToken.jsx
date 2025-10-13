import { useState } from "react";
const env = import.meta.env;
import ModalWrapper from "./ModalWrapper";

const NEW_ARBIFAKE_ADDRESS = env.VITE_NEW_ARBIFAKE_ADDRESS;
const NEW_DOGEFAKE_ADDRESS = env.VITE_NEW_DOGEFAKE_ADDRESS;

const ModalAddToken = ({ isVisible, onClose }) => {
  if (!isVisible) return null;
  const [loading, setLoading] = useState("");

  const addTokenToWallet = async (id, ticker, address) => {
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
    {
      id: 1,
      title: "ArbiFake",
      ticker: "AFAKE",
      address: NEW_ARBIFAKE_ADDRESS,
    },
    {
      id: 2,
      title: "DogeFake",
      ticker: "DFAKE",
      address: NEW_DOGEFAKE_ADDRESS,
    },
  ];

  return (
    <ModalWrapper
      isVisible={isVisible}
      onClose={onClose}
      title="Add token to your wallet"
    >
      <div className="bg-[#00df9a] p-2 rounded">
        {tokens.map((token) => (
          <div
            key={token.id}
            className="flex justify-around items-center font-mono py-2"
          >
            <div className="text-2xl text-black">{token.title}</div>
            <button
              onClick={() =>
                addTokenToWallet(token.id, token.ticker, token.address)
              }
            >
              {loading === token.id ? "loading..." : "Add"}
            </button>
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
};

export default ModalAddToken;
