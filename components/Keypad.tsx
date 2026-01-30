
import React from 'react';

interface KeypadProps {
  onInput: (value: string) => void;
  onClear: () => void;
  onBackspace: () => void;
}

const Keypad: React.FC<KeypadProps> = ({ onInput, onClear, onBackspace }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0', '.'];

  return (
    // Changed 'class' to 'className' to comply with React property naming
    <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto mt-4">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onInput(key)}
          className="h-12 flex items-center justify-center bg-white border border-gray-300 rounded-lg text-lg font-semibold hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
        >
          {key}
        </button>
      ))}
      <button
        onClick={onClear}
        className="h-12 flex items-center justify-center bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 active:scale-95 transition-all"
      >
        C
      </button>
      <button
        onClick={onBackspace}
        className="h-12 col-span-2 flex items-center justify-center bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
      >
        <i className="fa-solid fa-delete-left mr-2"></i> Xóa
      </button>
    </div>
  );
};

export default Keypad;
