function createLoadingElement() {
  const loadingElement = document.createElement('span');
  loadingElement.className = 'loading';
  loadingElement.id = 'loading';
  loadingElement.innerText = 'loading...';
  return loadingElement;
}

/* Consultas realizadas */

/**
 * função responsável por carregar os produtos da API
 * Além disso, ao receber a resposta da API, a função onEndingRequest é invocada.
 * @param {*} onEndingRequest
 */
 async function getProducts() {
  return fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
  .then((resp) => resp.json())
  .then((json) => json.results)
  .then((results) => results.map((result) => ({
    sku: result.id,
    name: result.title,
    image: result.thumbnail,
  })));
}

/**
 * função responsável por carregar os produtos do carrinho da API
 * e retornar uma Promise com os produtos no formato esperado.
 * Além disso, ao receber a resposta da API, a função onEndingRequest é invocada.
 * @param {int} sku 
 * @param {*} onEndingRequest
 */
async function getProductItem(sku) {
  return fetch(`https://api.mercadolibre.com/items/${sku}`)
  .then((resp) => resp.json())
  .then((result) => ({
    sku: result.id,
    name: result.title,
    salePrice: result.price,
  }));
}

/* FIM - Consultas */

function updateTotalPrice() {
  const cartItemsElement = document.getElementById('cart_items');

  const totalPrice = Array.from(cartItemsElement.getElementsByClassName('item_price'))
    .map((element) => parseFloat(element.innerText))
    .reduce((acc, cur) => acc + cur, 0);

  const cartPriceElement = document.getElementById('cart_price');
  cartPriceElement.innerText = totalPrice;
}

/**
 * função responsável por remover o produto na posição index do repo local (local storage)
 * @param {int} index 
 */
function removeFromLocalStorage(index) {
  if (localStorage.skus) {
    const skus = JSON.parse(localStorage.skus);
    skus.splice(index, 1);
    localStorage.skus = JSON.stringify(skus);
  }
}

function cartItemClickListener(event) {
  const cartItemsElement = event.target.parentNode;
  const index = Array.from(cartItemsElement.childNodes).indexOf(event.target);
  event.target.remove();
  removeFromLocalStorage(index);
  updateTotalPrice();
}

function createPriceItemElement(salePrice) {
  const span = document.createElement('span');
  span.innerText = salePrice;
  span.className = 'item_price';
  return span;
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $`;
  li.addEventListener('click', cartItemClickListener);
  // modificado para manipular o preço de forma mais simples.
  li.appendChild(createPriceItemElement(salePrice));
  return li;
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createClickableElement(element, className, innerText, clickListener) {
  const e = createCustomElement(element, className, innerText);
  e.addEventListener('click', clickListener);
  return e;
}

/**
 * função responsável por salvar o sku localmente (local storage)
 * 
 * OBS.: optei por salvar apenas o sku ao invés de todas as infos do
 * produto dado que, em situações reais, o preço do produto pode variar
 * após a adição no carrinho.
 * @param {int} sku 
 */
 function addToLocalStorage(sku) {
  const skus = localStorage.skus ? JSON.parse(localStorage.skus) : [];
  skus.push(sku);
  localStorage.skus = JSON.stringify(skus);
}

/**
 * função responsável por inserir os produtos do carrinho da API
 * na sua respectiva li e atualizando o preço total.
 * @param {int} sku 
 */
async function addToCartItems(sku) {
  const olCartItems = document.getElementById('cart_items');
  
  return getProductItem(sku)
  .then((product) => {
    const cartItemElement = createCartItemElement(product);
    olCartItems.appendChild(cartItemElement);
  });
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function addToCartClickListener(event) {
  const sku = getSkuFromProductItem(event.target.parentNode);
  const loadingElement = createLoadingElement();
  document.body.prepend(loadingElement);

  addToCartItems(sku)
    .then(setTimeout(() => document.body.removeChild(loadingElement), 500))
    .then(() => updateTotalPrice());

  addToLocalStorage(sku);
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createClickableElement('button', 'item__add', 
    'Adicionar ao carrinho!', addToCartClickListener));

  return section;
}

/**
 * função responsável por limpar o carrinho de compras.
 * Para isso, os elementos são removidos, o local storage
 * é limpo e o texto do preço do carrinho, zerado.
 */
function clearCartListener() {
  const cartItemsElement = document.getElementById('cart_items');
  while (cartItemsElement.childNodes.length > 0) {
    cartItemsElement.removeChild(cartItemsElement.lastChild);
  }
  
  localStorage.skus = JSON.stringify([]);

  const cartPriceElement = document.getElementById('cart_price');
  cartPriceElement.innerText = '0';
}

/**
 * função responsável por adicionar os produtos na seção items
 */
async function loadProducts() {
  const itemsSection = document.getElementById('items');
  const loadingDiv = document.getElementById('loading');

  return getProducts()
  .then((products) => products.map(createProductItemElement))
  .then((productItemElements) => productItemElements
    .forEach((productItemElement) => itemsSection.appendChild(productItemElement)))
  .then(setTimeout(() => loadingDiv.remove(), 1000));
}

/**
 * função responsável por carregar os produtos do carrinho do repo local (local storage)
 */
 async function loadFromLocalStorage() {
  const jsonSkus = localStorage.skus || '[]';
  const skus = JSON.parse(jsonSkus);
  return Promise.all(skus.map(addToCartItems))
    .then(() => updateTotalPrice());
}

window.onload = () => {
  // pegando o botão de limpar o carrinho e adicionando o listener respectivo.
  const clearButton = document.getElementById('empty-cart');
  clearButton.addEventListener('click', clearCartListener);

  const loadingElement = createLoadingElement();
  document.body.prepend(loadingElement);

  setTimeout(() => document.body.removeChild(loadingElement), 1000);

  // carregando infos dos produtos (via API) e do carrinho (via local storage)
  Promise.all([loadFromLocalStorage(), loadProducts()]);
  //  .then(setTimeout(() => document.body.removeChild(loadingElement), 500));
};
