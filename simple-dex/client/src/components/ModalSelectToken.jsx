import React, { useState } from "react";
import ModalWrapper from "./ModalWrapper";

const ModalSelectToken = ({
  baseTokens,
  isVisible,
  onClose,
  onDataSend,
  selectedToken,
}) => {
  if (!isVisible) return null;
  //   const [selectedToken, setSelectedToken] = useState();
  const handleChange = (e) => {
    onDataSend(e.target.value);
  };

  return (
    <ModalWrapper isVisible={isVisible} onClose={onClose}>
      <select
        className="py-2 mx-5 rounded-md text-2xl font-mono my-4"
        value={selectedToken.label}
        onChange={handleChange}
      >
        {baseTokens.map((baseToken) => (
          <option className="py-2" key={baseToken.id} value={baseToken.id}>
            {baseToken.label}
          </option>
        ))}
      </select>
    </ModalWrapper>
  );
};

export default ModalSelectToken;
