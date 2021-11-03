function createLoadingElement() {
  const p = document.createElement('p');
  p.className = 'loading';
  p.id = 'loading';
  p.innerText = 'loading...';
  return p;
}

/* Consultas realizadas */

/**
 * função responsável por carregar os produtos da API
 * Além disso, ao receber a resposta da API, a função onEndingRequest é invocada.
 * @param {*} onEndingRequest
 */
 async function getProducts(onEndingRequest) {
  return fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
  .then((resp) => resp.json())
  .then((json) => {
    onEndingRequest();
    return json.results;
  })
  .then((results) => results.map((result) => 
    ({
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
async function getProductItem(sku, onEndingRequest) {
  return fetch(`https://api.mercadolibre.com/items/${sku}`)
  .then((resp) => resp.json())
  .then((result) => {
    onEndingRequest();
    return ({
      sku: result.id,
      name: result.title,
      salePrice: result.price,
    });
  });
}

/* FIM - Consultas */

function updateTotalPrice(amount) {
  const cartPriceElement = document.getElementById('cart_price');

  let price = parseFloat(cartPriceElement.innerText);
  price = price || 0; 
  price += amount;

  cartPriceElement.innerText = price;
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

  const itemPriceElements = event.target.getElementsByClassName('item_price');

  if (itemPriceElements.length > 0) {
    const price = parseFloat(itemPriceElements[0].innerText);
    updateTotalPrice(-price);
  }
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
 function addToCartItems(sku) {
  const olCartItems = document.getElementById('cart_items');
  
  // adicionando a div de carregamento antes da requisição à API
  const loadingDiv = createLoadingElement();
  olCartItems.appendChild(loadingDiv);

  const onEndingRequest = () => olCartItems.removeChild(loadingDiv);
  
  getProductItem(sku, onEndingRequest)
  .then((product) => {
    const cartItemElement = createCartItemElement(product);
    olCartItems.appendChild(cartItemElement);
    updateTotalPrice(product.salePrice);
  });
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function addToCartClickListener(event) {
  const sku = getSkuFromProductItem(event.target.parentNode);
  addToCartItems(sku);
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
 function loadProducts() {
  const itemsSection = document.getElementById('items');
  
  // adicionando a div de carregamento antes da requisição à API
  const loadingDiv = createLoadingElement();
  itemsSection.appendChild(loadingDiv);

  const onEndingRequest = () => itemsSection.removeChild(loadingDiv);

  getProducts(onEndingRequest)
  .then((products) => products.map(createProductItemElement))
  .then((productItemElements) => productItemElements
    .forEach((productItemElement) => itemsSection.appendChild(productItemElement)));
}

/**
 * função responsável por carregar os produtos do carrinho do repo local (local storage)
 */
 function loadFromLocalStorage() {
  if (localStorage.skus) {
    const skus = JSON.parse(localStorage.skus);
    skus.forEach(addToCartItems);
  }
}

window.onload = () => {
  // pegando o botão de limpar o carrinho e adicionando o listener respectivo.
  const clearButton = document.getElementById('empty-cart');
  clearButton.addEventListener('click', clearCartListener);

  // inicializando o preço do carrinho
  updateTotalPrice(0);

  // carregando infos dos produtos (via API) e do carrinho (via local storage)
  loadProducts();
  loadFromLocalStorage();
};
