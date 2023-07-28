import express from "express";
import mongoosePaginate from 'mongoose-paginate-v2';
import ProductsManager from "../dao/mongo/manager/products.js";
import CartsManager from "../dao/mongo/manager/carts.js";
const router = express.Router();

const productsManager = new ProductsManager();
const cartManager = new CartsManager();
/*
router.get("/realtimeproducts", (req, res) => {
    const products = productManager.getProducts();
    res.render('realTimeProducts', { products });
});*/

router.get("/products", async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
  
    // Obtener la lista de productos paginados desde el gestor de productos
    const { products, totalPages, currentPage, totalProducts } = await productsManager.getProductsPaginated(limit, page);
  
    // Calcular los enlaces de paginación
    const prevLink = currentPage > 1 ? `/products?limit=${limit}&page=${parseInt(page) - 1}` : null;
    const nextLink = currentPage < totalPages ? `/products?limit=${limit}&page=${parseInt(page) + 1}` : null;
    
    // Renderizar la vista products.handlebars con los datos de los productos y la paginación
    res.render("products", { products, totalPages, currentPage, totalProducts, prevLink, nextLink });
  });


router.get('/carts/:cid',async(req,res)=>{
  const cartId = req.params.cid;

  // Obtener el carrito específico utilizando el gestor de carritos
  const cart = await cartManager.getCart(cartId);

  // Verificar si el carrito existe
  if (!cart) {
    return res.status(404).send("Carrito no encontrado");
  }

  // Obtener los productos asociados al carrito
  const products = await cartManager.getCartProducts(cartId);
  // Renderizar la vista cart.handlebars con los datos del carrito y los productos
  res.render("cart", { cart, products });
})


export default router;