import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { idText, createUnparsedSourceFile } from 'typescript';
import api from '../services/api';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const response = await AsyncStorage.getItem('@GoMarketplace:products');
      if (response) {
        setProducts(JSON.parse(response));
      }
    }

    loadProducts();
  }, []);

  // função para atualizar os produtos

  useEffect(() => {
    async function productsUpdate(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
      //   await AsyncStorage.removeItem('@GoMarketplace:products');
    }
    productsUpdate();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART

      const productIndex = products.findIndex(p => p.id === product.id);

      if (productIndex >= 0) {
        const productsUpdated = products.map(item => {
          if (item.id === product.id) {
            item.quantity += 1;
          }
          return item;
        });
        setProducts(productsUpdated);
      } else {
        const newProduct = product;
        newProduct.quantity = 1;
        setProducts([...products, newProduct]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productsUpdated = products.map(item => {
        if (item.id === id) {
          item.quantity += 1;
        }
        return item;
      });
      setProducts(productsUpdated);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productFinded = products.find(product => product.id === id);
      if (productFinded?.quantity === 1) {
        const productsUpdated = products.filter(product => product.id !== id);
        setProducts(productsUpdated);
      } else {
        const productsUpdated = products.map(product => {
          if (product.id === id) {
            product.quantity -= 1;
          }
          return product;
        });
        setProducts(productsUpdated);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
