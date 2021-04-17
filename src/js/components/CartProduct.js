import {select} from './settings.js';
import AmountWidget from './components/AmountWidget.js';

class CartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
    // console.log('cartProduct:', thisCartProduct);
  }

  initAmountWidget(){
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.amountWidget.setValue(thisCartProduct.amount);

    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
      if(thisCartProduct.amount !== thisCartProduct.amountWidget.value){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
        // console.log('changes:', thisCartProduct.amount, thisCartProduct.price);

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      }
    });
  }

  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
    // console.log('Function remove in on!');
  }

  initActions(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault();
    });

    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();

      thisCartProduct.remove();
    });
  }

  getData(){
    const thisCartProduct = this;

    const dataForOrder = {};

    dataForOrder.id = thisCartProduct.id;
    dataForOrder.amount = thisCartProduct.amount;
    dataForOrder.price = thisCartProduct.price;
    dataForOrder.priceSingle = thisCartProduct.priceSingle;
    dataForOrder.name = thisCartProduct.name;
    dataForOrder.params = thisCartProduct.params; 

    return dataForOrder;
  }

  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }
}

export default CartProduct;