import React from "react";

function Loader() {
  return (
    <div className="ml-auto text-gray-800 p-3 rounded-lg max-w-xs flex items-center justify-end space-x-2">
      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-150"></span>
      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-300"></span>
    </div>
  );
}

export default Loader;
