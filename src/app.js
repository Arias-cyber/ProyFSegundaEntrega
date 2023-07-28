import express, { urlencoded } from 'express';
import products from "./routes/products.router.js"
import carts from "./routes/carts.router.js"
import viewsRouter from "./routes/views.router.js";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import {Server} from "socket.io"
import { createServer } from 'http';
import ProductManager from "./dao/filesystem/manager/ProductManager.js";
import mongoose from 'mongoose'
import Message from './dao/mongo/models/message.js';
import Handlebars from 'handlebars';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';

const hbs = handlebars.create({
  handlebars: allowInsecurePrototypeAccess(Handlebars)
});

const app = express();
const connection = await mongoose.connect("mongodb+srv://gustavo2021arias:A12345@pruebacoder.pkazyau.mongodb.net/?retryWrites=true&w=majority")


const httpServer = createServer(app);
const io = new Server(httpServer);
const productManager = new ProductManager();

app.use(express.json());
app.use(urlencoded({ extended: true }))
app.use('/api/products',products);
app.use('/api/carts',carts);


app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

app.use("/",viewsRouter)
app.get('/filesystem', (req, res) => {
    const products = productManager.getProducts();
    res.render('home', { products });
  });


  app.get('/chat', async (req, res) => {
    const messages = await Message.find().lean();
    res.render('chat', { messages });
  });

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');

  socket.on('message', async (data) => {
    const { user, message } = data;

  if (!user || user.trim() === '') {
    console.log('Error: el campo "user" es requerido');
    return;
  }

    // Guardar el mensaje en la colección "messages" en MongoDB
    const newMessage = new Message({ user, message });
    await newMessage.save();

    // Emitir el evento "messageLogs" a todos los clientes conectados
    const messages = await Message.find().lean();
    io.emit('messageLogs', messages);
  });


  });

  httpServer.listen(8080, () => {
    console.log('Server is running on port 8080');
  });
  
export {io};


/** EJEMPLO PARA PROBAR EL POST
 * {
    "title":"pizza"
    ,"description":"Este es un producto prueba 6"
    ,"code":"54fd",
    "price":340,
    "status":true,
    "stock":56,
    "category":"comida",
    "thumbnail":"sim imagen"
} */
// Ids de los carts para testear : 64c2f793f82c03da4a4720fb - 64c2f7ddf82c03da4a472101  - 64c2f923f82c03da4a472103  - 64c2f932f82c03da4a472105
//Vista de productos con paginacion: localhost:8080/products
//Vista de un carrito localhost:8080/carts/64a3a068b2d2e5ac49890d83  (el id se puede cambiar por cualquiera de arriba)

/*CONSULTAS AL ENDPOINT (reemplazar la x por el id)
para PRODUCTS
*varias consultas para GET
localhost:8080/api/products
localhost:8080/api/products?limit=5
localhost:8080/api/products?available=true
localhost:8080/api/products?query=tech
localhost:8080/api/products?available=true&sort=asc
localhost:8080/api/products/x
*POST
localhost:8080/api/products/
*PUT Y DELETE
localhost:8080/api/products/x

para CARTS
*POST
localhost:8080/api/carts
*GET
localhost:8080/api/carts/X
*POST de un product en un cart
localhost:8080/api/carts/x/product/x  
*DELETE de un producto del carrito
localhost:8080/api/carts/x/products/x
*DELETE de todos los productos del carrito
localhost:8080/api/carts/x
*PUT de actualizar el carrito con varios elementos
localhost:8080/api/carts/x
ejemplo del formato para el PUT
{
  "products": [
    {
      "product": "64c2f793f82c03da4a4720fb",
      "quantity": 2
    },
    {
      "product": "64c2f7ddf82c03da4a472101",
      "quantity": 3
    },
    {
      "product": "64c2f923f82c03da4a472103",
      "quantity": 1
    }
  ]
}
*PUT para actualizar solo la cantidad de un producto
localhost:8080/api/carts/x/products/x
{
  "quantity": 7
}*/
