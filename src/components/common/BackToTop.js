import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4">
      {isVisible && (
        <button
          className="bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-b hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-bold py-2 px-4 rounded-full flex flex-col items-center transition-colors duration-300"
          onClick={scrollToTop}
        >
          <FaArrowUp className="text-lg" />
          <span className="text-xs md:text-sm">Top</span>
        </button>
      )}
    </div>
  );
};

export default BackToTopButton;
