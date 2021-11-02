/* Consultas realizadas */

/**
 * função responsável por carregar os produtos da API
 * retornando uma Promise com os produtos no formato esperado.
 */
 async function getProducts(){
  return fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
  .then((resp) => resp.json())
  .then((json) => json.results)
  .then((results) => results.map(result => 
      ({
        sku : result.id,
        name : result.title,
        image : result.thumbnail
      })
    )
  );
}

/**
 * função responsável por carregar os produtos do carrinho da API
 * e retornar uma Promise com os produtos no formato esperado.
 * @param {int} sku 
 */
async function getProductItem(sku){
  return fetch(`https://api.mercadolibre.com/items/${sku}`)
  .then((resp) => resp.json())
  .then((result) => 
    ({
      sku : result.id,
      name : result.title,
      salePrice : result.price
    })
  );
}

/* FIM - Consultas */

function updateTotalPrice(amount){
  const cartPriceElement = document.getElementById('cart_price');

  let price = parseFloat(cartPriceElement.innerText);
  price = price ? price : 0; 
  price += amount;

  cartPriceElement.innerText = price;
}

/**
 * função responsável por remover o produto na posição index do repo local (local storage)
 * @param {int} index 
 */
function removeFromLocalStorage(index){
  if(localStorage.skus){
    const skus = JSON.parse(localStorage.skus);
    skus.splice(index,1)
    localStorage.skus = JSON.stringify(skus);
  }
}

function cartItemClickListener(event) {
  const cartItemsElement = event.target.parentNode;
  index = Array.from(cartItemsElement.childNodes).indexOf(event.target);
  event.target.remove();
  removeFromLocalStorage(index);

  const itemPriceElements = event.target.getElementsByClassName('item_price');

  if(itemPriceElements.length > 0){
    const price = parseFloat(itemPriceElements[0].innerText);
    updateTotalPrice(-price);
  }
}

function createPriceItemElement(salePrice){
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

function createClickableElement(element, className, innerText, clickListener){
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
 function addToLocalStorage(sku){
  const skus = localStorage.skus ? JSON.parse(localStorage.skus) : []
  skus.push(sku);
  localStorage.skus = JSON.stringify(skus);
}

/**
 * função responsável por inserir os produtos do carrinho da API
 * na sua respectiva li e atualizando o preço total.
 * @param {int} sku 
 */
 function addToCartItems(sku){
  const olCartItems = document.getElementById('cart_items');
  
  getProductItem(sku)
  .then((product) => {
    const cartItemElement = createCartItemElement(product);
    olCartItems.appendChild(cartItemElement);
    updateTotalPrice(product.salePrice);
  });
}

function addToCartClickListener(event){
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
  section.appendChild(createClickableElement('button', 'item__add', 'Adicionar ao carrinho!', addToCartClickListener));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

/**
 * função responsável por limpar o carrinho de compras.
 * Para isso, os elementos são removidos, o local storage
 * é limpo e o texto do preço do carrinho, zerado.
 * @param {PointerEvent} event 
 */
function clearCartListener(event){
  const cartItemsElement = document.getElementById('cart_items');
  while(cartItemsElement.childNodes.length > 0){
    cartItemsElement.removeChild(cartItemsElement.lastChild);
  }
  
  localStorage.skus = JSON.stringify([]);

  const cartPriceElement = document.getElementById('cart_price');
  cartPriceElement.innerText = '0';
}

/**
 * função responsável por adicionar os produtos na seção items
 */
 function loadProducts(){
  const itemsSection = document.getElementById('items');

  getProducts()
  .then( products => products.map(createProductItemElement))
  .then( productItemElements => productItemElements
    .forEach(productItemElement => itemsSection.appendChild(productItemElement)) 
  )
}

/**
 * função responsável por carregar os produtos do carrinho do repo local (local storage)
 */
 function loadFromLocalStorage(){
  if(localStorage.skus){
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
