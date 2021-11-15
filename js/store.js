const STORAGE = sessionStorage;
const INITIAL_CART = { items: [] };

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function checkCart() {
  if (!STORAGE.getItem("cart")) STORAGE.setItem("cart", JSON.stringify(INITIAL_CART));
}

function putItemToCart(item) {
  checkCart();
  const cart = fetchCartFromStorage();

  let { items } = cart;

  items.push({ quantity: 1, ...item });
  total = calculateTotal({ items });

  putCartToStorage({ items, total });
}

function putCartTotalPrice(total) {
  checkCart();
  const cart = fetchCartFromStorage();

  cart.total = total;

  putCartToStorage({ total, ...cart });
}

function fetchCartFromStorage() {
  checkCart();
  return JSON.parse(STORAGE.getItem("cart"));
}

function putCartToStorage(cart) {
  STORAGE.setItem("cart", JSON.stringify(cart));
}

function removeItemFromCart(itemId) {
  const cart = fetchCartFromStorage();

  const items = cart.items.filter((i) => i.id !== itemId);

  putCartToStorage({ items });

  updateTotalPrice();
  document.querySelector(".number-of-items").innerText = "(" + fetchCartFromStorage().items.length + ")";
}

function changeQuantity(itemId, newQuantity) {
  if (parseInt(newQuantity) < 1) {
    document.querySelector(".cart-quantity-input").value = 1;
    return;
  }

  const cart = fetchCartFromStorage();

  const items = cart.items.filter((i) => i.id === itemId);
  items[0].quantity = newQuantity;

  putCartToStorage({ ...cart });
}

function calculateTotal(cart) {
  return cart.items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
}

function updateTotalPrice() {
  const cart = fetchCartFromStorage();

  const totalCartPrice = calculateTotal(cart);
  const shippingPrice = totalCartPrice < 6000 ? 250 : 0;

  //ako je cart prazan -> napisi crticu ili 'prazan'; ako

  document.querySelector(".shipping-price").innerText = `${shippingPrice} RSD`;
  document.querySelector(".cart-total-price").innerText = `${totalCartPrice + shippingPrice} RSD`;
  if (cart.items.length === 0) {
    document.querySelector(".shipping-price").innerText = ` - RSD`;
  }
  if (cart.items.length === 0) {
    document.querySelector(".cart-total-price").innerText = `- RSD`;
  }
}

function itemId(title, color, size) {
  return `${title}|${color}|${size}`;
}

function ready() {
  var removeCartItemButtons = document.getElementsByClassName("btn-danger");
  for (var i = 0; i < removeCartItemButtons.length; i++) {
    var button = removeCartItemButtons[i];
    button.addEventListener("click", removeCartItem);
  }

  var quantityInputs = document.getElementsByClassName("cart-quantity-input");
  for (var i = 0; i < quantityInputs.length; i++) {
    var input = quantityInputs[i];
    input.addEventListener("change", quantityChanged);
  }

  var addToCartButtons = document.getElementsByClassName("shop-item-button");
  for (var i = 0; i < addToCartButtons.length; i++) {
    var button = addToCartButtons[i];
    button.addEventListener("click", addToCartClicked);
  }
  document.querySelector(".number-of-items").innerText = "(" + fetchCartFromStorage().items.length + ")";

  document.getElementsByClassName("btn-purchase")[0];

  document.getElementById("myDropdownS").addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

// function purchaseClicked() {
//   alert("Thank you for your purchase");
//   var cartItems = document.getElementsByClassName("cart-items")[0];
//   while (cartItems.hasChildNodes()) {
//     cartItems.removeChild(cartItems.firstChild);
//   }
//   updateCartTotal();
// }

function quantityChanged(event) {
  var input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  updateCartTotal();
}

function addToCartClicked(event) {
  const button = event.target;
  event.stopPropagation();

  const shopItem = button.parentElement.parentElement;

  const title = shopItem.getElementsByClassName("shop-item-title")[0].innerText;
  const price = shopItem.getElementsByClassName("shop-item-price")[0].innerText;
  // const size = document.querySelector(".size.selected").innerText;
  const imageSrc = document.querySelector(".product-images .product-image").src;

  addItemToCart(title, price, imageSrc);
  showCart();
}

function showCart() {
  const cart = fetchCartFromStorage();

  const { items } = cart;

  var cartItems = document.getElementsByClassName("cart-items")[0];
  cartItems.innerHTML = "";
  items.forEach((item) => {
    const { title, color, price, imageSrc, quantity, size } = item;

    var cartRow = document.createElement("div");
    cartRow.classList.add("cart-row");

    var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" >
        </div>
        <div class="cart-title-color">
        <span class="cart-item-title">${title} </span>
        <input class="cart-quantity-input" type="number" value="${quantity}">
        </div>
        <span class="cart-price cart-column">${price} RSD</span>
        <div class="cart-quantity cart-column">
            <div class="btn btn-danger" type="button">x</div>
        </div>`;
    cartRow.innerHTML = cartRowContents;

    cartItems.append(cartRow);

    // Remove item
    cartRow.getElementsByClassName("btn-danger")[0].addEventListener("click", () => {
      removeItemFromCart(itemId(title, color, size));
      cartRow.remove();
    });

    // Change quantity

    cartRow.getElementsByClassName("cart-quantity-input")[0].addEventListener("change", (e) => {
      changeQuantity(itemId(title, color, size), e.target.value);
      updateTotalPrice();
    });
  });

  let shippingCosts = calculateTotal(cart) < 6000 ? 250 : 0;

  const shippingCostEl = document.createElement("div");

  shippingCostEl.innerHTML = `
      <div class="shipping-cost">
      <strong class="shipping-cost-title">Dostava:</strong>
      <span class="shipping-price"> ${shippingCosts}RSD</span>
    </div>
    `;

  cartItems.append(shippingCostEl);

  const subTotal = document.createElement("div");

  subTotal.innerHTML = `
      <div class="cart-total">
      <strong class="cart-total-title">Ukupno:</strong>
      <span class="cart-total-price"> ${calculateTotal(cart) + shippingCosts} RSD</span>
    </div>
    `;

  cartItems.append(subTotal);

  document.getElementById("myDropdownS").classList.toggle("show");

  if (document.getElementById("myDropdownS").classList.contains("show")) {
    // document.getElementById("myDropdownS").classList.remove("show");
  } else {
    // document.getElementById("myDropdownS").classList.add("show");
  }
  if (cart.items.length === 0) {
    document.querySelector(".shipping-price").innerText = ` - RSD`;
  }
  if (cart.items.length === 0) {
    document.querySelector(".cart-total-price").innerText = `- RSD`;
  }
}

function addItemToCart(title, priceStr, imageSrc, color, size) {
  const cart = fetchCartFromStorage();

  // Uniquely identifies the item
  const id = itemId(title, color, size);

  if (cart.items.some((item) => id === item.id)) {
    alert("This item is already added to the cart");
    return;
  }

  const price = Number(priceStr.replace(/[RSD,. ]/g, ""));
  const quantity = document.querySelector(".count-holder").innerText;

  putItemToCart({ id, title, price, imageSrc, color, size, quantity });

  document.querySelector(".number-of-items").innerText = "(" + fetchCartFromStorage().items.length + ")";
}

// const sizes = document.querySelectorAll(".size");

// sizes.forEach((s) =>
//   s.addEventListener("click", (event) => {
//     sizes.forEach((s) => s.classList.remove("selected"));
//     event.target.classList.add("selected");
//   })
// );

window.onclick = function (event) {
  if (event.target.matches("dropdown-contentS")) return;

  if (!event.target.matches(".dropbtnS")) {
    var dropdowns = document.getElementsByClassName("dropdown-contentS")[0];
    if (dropdowns.classList.contains("show")) {
      dropdowns.classList.remove("show");
    }
  }
};
