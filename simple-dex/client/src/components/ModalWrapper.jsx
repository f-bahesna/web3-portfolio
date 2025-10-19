import { FaWindowClose } from "react-icons/fa";

const ModalWrapper = ({ isVisible, onClose, title, children }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-[-400px] inset-0 backdrop-blur-md flex justify-center items-center">
      <div className="w-[600px] bg-[#3dad8a] flex flex-col rounded-2xl">
        <div className="text-black text-xl my-2 ml-2 justify-center cursor-pointer">
          <FaWindowClose onClick={onClose} />
        </div>
        <div className="p-2 bg-[#329072]">
          <div className="text-2xl font-mono font-bold capitalize text-black">
            {title}
          </div>
        </div>
        <div className="bg-[#329072] rounded-b-2xl">{children}</div>
      </div>
    </div>
  );
};

export default ModalWrapper;
