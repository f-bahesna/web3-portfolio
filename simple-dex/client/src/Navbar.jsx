import { useState, useEffect } from "react";
import ModalAddToken from "./components/ModalAddToken";
import ModalFaucet from "./components/ModalFaucet";
import { IoIosLogOut } from "react-icons/io";

const Navbar = ({ account, disconnectAccount }) => {
  const [nav, setNav] = useState(false);
  const [showModalAddToken, setShowModalAddToken] = useState(false);
  const [showModalFaucet, setShowModalFaucet] = useState(false);

  const handleNav = () => {
    setNav(!nav);
  };

  const navItems = [
    { id: 1, text: "Faucet" },
    { id: 2, text: "Token" },
  ];

  const handleNavClick = (item) => {
    if (item.text === "Token") {
      setShowModalAddToken(true);
    }

    if (item.text === "Faucet") {
      setShowModalFaucet(true);
    }
  };

  return (
    <div className="bg-black rounded-lg flex justify-center sm:justify-between items-center h-24 max-w-[1240px] px-4 text-white">
      <h1 className="text-1xl sm:block font-bold text-[#00df9a] cursor-default">
        SimpleDEX
      </h1>
      {account ? (
        <ul className="hidden sm:flex">
          {navItems.map((item) => (
            <li
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="p-4 hover:bg-[#00df9a] font-mono rounded-xl m-2 cursor-pointer duration-300 hover:text-black"
            >
              {item.text}
            </li>
          ))}
          <li
            onClick={disconnectAccount}
            className="p-4 text-2xl hover:text-[#00df9a] rounded-xl m-2 cursor-pointer duration-300"
          >
            <IoIosLogOut />
          </li>
        </ul>
      ) : (
        ""
      )}

      {showModalAddToken && (
        <ModalAddToken
          isVisible={showModalAddToken}
          onClose={() => setShowModalAddToken(false)}
        ></ModalAddToken>
      )}
      {showModalFaucet && (
        <ModalFaucet
          isVisible={showModalFaucet}
          onClose={() => setShowModalFaucet(false)}
        ></ModalFaucet>
      )}
    </div>
  );
};

export default Navbar;
