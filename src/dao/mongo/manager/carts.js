import cartModel from "../models/cart.js";
import productModel from "../models/product.js";

export default class CartsManager{
    constructor() {
        this.cartModel = cartModel;
        this.productModel = productModel;
      }

    getCart=(id)=>{
        return cartModel.findById(id);
    }

    createCart = (cart) => {
        return cartModel.create(cart)
    }

    addProductToCart = async (cartId, productId, quantity = 1) => {
        try {
            const cart = await this.cartModel.findById(cartId);
            if (!cart) {
              return 'Carrito no encontrado';
            }
            const product = await this.productModel.findById(productId);
            if (!product) {
              return 'El producto no existe';
            }
        
            const productIndex = cart.products.findIndex((p) => p.product.equals(productId));
            if (productIndex !== -1) {
              // Si el producto ya existe en el carrito, se suma la cantidad
              cart.products[productIndex].quantity += quantity;
            } else {
              // Si el producto no existe en el carrito, se agrega como un nuevo elemento
              cart.products.push({ product: productId, quantity });
            }
            await cart.save(); // Guarda los cambios en el documento del carrito
            return 'Producto agregado al carrito exitosamente';
          } catch (error) {
            console.error('Error al agregar el producto al carrito:', error);
            return 'Error al agregar el producto al carrito';
          }
        }
  getCartProducts = async (cartId) => {
    try {
      const cart = await this.cartModel
        .findById(cartId)
        .populate("products.product")
        .lean();
  
      if (!cart) {
        return null;
      }
  
      return cart.products.map((item) => {
        return {
          product: item.product,
          quantity: item.quantity,
        };
      });
    } catch (error) {
      console.error("Error al obtener los productos del carrito:", error);
      throw error;
    }
  };
}