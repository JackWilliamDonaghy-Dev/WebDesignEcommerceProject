

/*
Prompts used:
Create a simple Node.js module that reads and writes JSON data to files for an e-commerce application. The module should have functions to get and save product data and cart data.
*/


const fs = require('fs');
const path = require('path');

function readJson(fileName) {
  const filePath = path.join(__dirname, 'data', fileName);
  const json = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(json);
}

function writeJson(fileName, data) {
  const filePath = path.join(__dirname, 'data', fileName);
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json, 'utf8');
}

function getProducts() {
  return readJson('tickets.json');
}

function saveProducts(products) {
  writeJson('tickets.json', products);
}

function getCart() {
  return readJson('cart.json');
}

function saveCart(cart) {
  writeJson('cart.json', cart);
}

module.exports = {
  getProducts,
  saveProducts,
  getCart,
  saveCart
};

//This was made by me

function renderProducts() {
  const container = document.getElementById('product-container');
  const products = datastore.getProducts();

  products.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product-item';

    const title = document.createElement('h3');
    title.textContent = product.name;
    productDiv.appendChild(title);

    const price = document.createElement('p');
    price.textContent = `$${product.price.toFixed(2)}`;
    productDiv.appendChild(price);

    const addButton = document.createElement('button');
    addButton.textContent = 'Add to Cart';
    addButton.addEventListener('click', () => {
      addToCart(product.id);
    });
    productDiv.appendChild(addButton);

    container.appendChild(productDiv);
  });
}
renderProducts();