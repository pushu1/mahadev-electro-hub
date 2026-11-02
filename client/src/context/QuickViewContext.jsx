import React, { createContext, useContext, useState } from 'react';

const QuickViewContext = createContext();

export function QuickViewProvider({ children }) {
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const openQuickView = (product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  return (
    <QuickViewContext.Provider
      value={{
        quickViewProduct,
        openQuickView,
        closeQuickView,
      }}
    >
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) {
    throw new Error('useQuickView must be used within QuickViewProvider');
  }
  return ctx;
}
