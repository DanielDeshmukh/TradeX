const MiniModal = ({ children, modalRef }) => {
  return (
    <div
      ref={modalRef}
      className="absolute top-10 z-50 w-36 bg-[#1E1E24] rounded-lg shadow-xl p-2 border border-[#2C3036]"
    >
      {children}
    </div>
  );
};

export default MiniModal;
