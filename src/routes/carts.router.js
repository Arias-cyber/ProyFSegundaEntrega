import { Router } from "express";
//import CartManager from "../CartManager.js";
import CartsManager from "../dao/mongo/manager/carts.js";
import ProductsManager from "../dao/mongo/manager/products.js";
const productsManager = new ProductsManager();
//const cartManager = new CartManager();

const cartsManager = new CartsManager();

const router = Router();

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const cart = await cartsManager.getCart(id);
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ error: 'Carrito no encontrado' });
    }
  });
  
  router.post("/", async (req, res) => {
    const { products } = req.body;
    const cart = { products };
    const newCart = await cartsManager.createCart(cart);
    res.status(201).json(newCart);
  });

  router.post("/:cid/product/:pid", async (req, res) => {

    try {
        const {cid,pid } = req.params;
        const { quantity } = req.body;
        const cart = await cartsManager.getCart(cid);
        if (!cart) {
          return 'Carrito no encontrado';
        }
        const product = await productsManager.getProduct(pid);
        if (!product) {
          return 'El producto no existe';
        }
        const result=  await cartsManager.addProductToCart(cid,pid,quantity)
        res.json({message: 'Producto agregado al carrito exitosamente'});
    } catch (error) {
        return res.status(400).json({status:"error",message:"Cannot add product: "+ error})
    }
  });

router.delete("/:cid/products/:pid", async(req,res)=>{
  try {
    const { cid, pid } = req.params;
    const cart = await cartsManager.getCart(cid);
    
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    const product = await productsManager.getProduct(pid);
    
    if (!product) {
      return res.status(404).json({ error: 'El producto no existe' });
    }
    const productIndex = cart.products.findIndex((p) => p.product.equals(product._id));
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'El producto no existe en el carrito '  + productIndex});
    }

    cart.products.splice(productIndex, 1);
    await cart.save();
    
    res.json({ message: 'Producto eliminado del carrito exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto del carrito ' + error });
  }})

router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    
    const cart = await cartsManager.getCart(cid);
    
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    
    cart.products = products;
    await cart.save();
    
    res.json({ message: 'Carrito actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el carrito: '+error });
  }
});


router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    // Obtener el carrito
    const cart = await cartsManager.getCart(cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    const product = await productsManager.getProduct(pid);
    if (!product) {
      return res.status(404).json({ error: 'El producto no existe' });
    }
    const productIndex = cart.products.findIndex((p) => p.product.equals(product._id));

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    // Actualizar la cantidad del producto
    cart.products[productIndex].quantity = quantity;

    // Guardar los cambios en el carrito
    await cart.save();

    res.json({ message: 'Cantidad de ejemplares del producto actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la cantidad del producto en el carrito' + error });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartsManager.getCart(cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    
    // Vaciar el arreglo de productos del carrito
    cart.products = [];
    
    // Guardar los cambios en el carrito
    await cart.save();
    
    return res.json({ message: 'Productos eliminados del carrito exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar los productos del carrito' });
  }
});

/* COMENTARIO DE FILESYSTEM
router.post("",(req,res)=>{
    const newCart = cartManager.addCart();
    if (newCart == 'Carrito creado exitosamente') {
        res.status(201).json({ message: 'Carrito creado exitosamente' });
    } else {
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

router.get("/:id",(req,res)=>{
    const { id } = req.params
    const parsedId = parseInt(id); 
    const cart= cartManager.getCartById(parsedId)
    if (cart) return res.json(cart);
    else res.json({ error: "Carrito no encontrado" });
})

router.post("/:cid/product/:pid",(req,res)=>{
    const {cid,pid } = req.params;
    const parsedCid = parseInt(cid); 
    const parsedPId = parseInt(pid); 
    const { quantity } = req.body;
    const result= cartManager.addProductInCart(parsedCid,parsedPId,quantity)
    if (result === 'Producto agregado al carrito exitosamente') {
        res.status(201).json({ message: 'Producto agregado al carrito exitosamente' });
    } else if (result === 'Carrito no encontrado') {
        res.status(404).json({ error: 'Carrito no encontrado' });
    } else if (result === 'El producto no existe') {
        res.status(404).json({ error: 'El producto no existe' });
    }else {
        res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
});*/
export default router;
