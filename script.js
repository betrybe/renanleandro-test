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

/* FIM - Consultas */

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
  // coloque seu código aqui
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

window.onload = () => {
  loadProducts();
 };
