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

function cartItemClickListener(event) {
  const cartItemsElement = event.target.parentNode;
  index = Array.from(cartItemsElement.childNodes).indexOf(event.target);
  event.target.remove();
  removeFromLocalStorage(index);
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

/* Consultas realizadas */

/**
 * função responsável por carregar os produtos da API
 * e inseri-los na section items.
 */
 function loadProducts(){
  const sectionItems = document.getElementById('items');

  fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
    .then((resp) => resp.json())
    .then((json) => json.results)
    .then((results) => results.forEach(result => {
        const sectionProduct = createProductItemElement({
          sku : result.id,
          name : result.title,
          image : result.thumbnail
        });
        sectionItems.appendChild(sectionProduct);
        sectionItems.appendChild(sectionProduct);
      })
    );
}

/**
 * função responsável por carregar os produtos do carrinho da API
 * e inseri-los na sua respectiva li.
 * @param {int} sku 
 */
function addToCartItems(sku){
  const olCartItems = document.getElementById('cart_items');
  fetch(`https://api.mercadolibre.com/items/${sku}`)
    .then((resp) => resp.json())
    .then((result) => {
      const cartItemElement = createCartItemElement({
        sku : result.id,
        name : result.title,
        salePrice : result.price
      });
      olCartItems.appendChild(cartItemElement);
    });
}

/* FIM - Consultas */

/* Local Storage */

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

/**
 * função responsável por carregar os produtos do carrinho do repo local (local storage)
 */
function loadFromLocalStorage(){
  if(localStorage.skus){
    const skus = JSON.parse(localStorage.skus);
    skus.forEach(addToCartItems);
  }
}

/* FIM - Local Storage */

window.onload = () => {
  loadProducts();
  loadFromLocalStorage();
};
