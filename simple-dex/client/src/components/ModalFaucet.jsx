import { useState } from "react";
import ArbiFake from "../contracts/ArbiFake.json";
import DogeFake from "../contracts/DogeFake.json";
import ModalWrapper from "./ModalWrapper";
import { getFaucet } from "./../utils/web3config";

const env = import.meta.env;
const NEW_ARBIFAKE_ADDRESS = env.VITE_NEW_ARBIFAKE_ADDRESS;
const NEW_DOGEFAKE_ADDRESS = env.VITE_NEW_DOGEFAKE_ADDRESS;

const ModalFaucet = ({ isVisible, onClose }) => {
  if (!isVisible) return null;
  const [loading, setLoading] = useState("");

  const addTokenFaucetToWallet = async (id, ticker, address, abi) => {
    setLoading(id);

    await getFaucet(ticker, address, abi);

    setLoading(null);
  };

  const tokens = [
    {
      id: 1,
      title: "ArbiFake",
      ticker: "AFAKE",
      address: NEW_ARBIFAKE_ADDRESS,
      abi: ArbiFake.abi,
    },
    {
      id: 2,
      title: "DogeFake",
      ticker: "DFAKE",
      address: NEW_DOGEFAKE_ADDRESS,
      abi: DogeFake.abi,
    },
  ];

  return (
    <ModalWrapper
      isVisible={isVisible}
      onClose={onClose}
      title="Get Faucet Tokens"
    >
      <div className="bg-[#00df9a] p-2 rounded">
        {tokens.map((token) => (
          <div
            key={token.id}
            className="flex justify-around items-center font-mono py-2"
          >
            <button
              className="bg-black p-2 px-4 rounded-md hover:bg-[#016244]"
              onClick={() =>
                addTokenFaucetToWallet(
                  token.id,
                  token.ticker,
                  token.address,
                  token.abi
                )
              }
            >
              {loading === token.id
                ? "Sending token..."
                : `Send me ${token.ticker}`}
            </button>
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
};

export default ModalFaucet;
