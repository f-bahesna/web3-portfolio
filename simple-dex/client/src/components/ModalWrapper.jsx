import { FaWindowClose } from "react-icons/fa";

const ModalWrapper = ({ isVisible, onClose, title, children }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
      <div className="w-[600px] bg-green-300 flex flex-col">
        <div className="text-black text-xl my-2 ml-2  justify-center">
          <FaWindowClose onClick={onClose} />
        </div>
        <div className="bg-[#00df9a] p-2 rounded">
          <div className="text-2xl font-mono font-bold capitalize text-black">
            {title}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;
