import {select, classNames, templates} from './settings.js';
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    // console.log('new Product:', thisProduct);

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generateHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.dom = {};
    thisProduct.dom.element = utils.createDOMFromHTML(generateHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.dom.element);
  }

  initAccordion(){
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    /*const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);*/

    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProduct = document.querySelector('article.' + classNames.menuProduct.wrapperActive);

      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct && activeProduct !== thisProduct.dom.element){
        activeProduct.classList.remove('active');
      }

      /* toggle active class on thisProduct.element */
      thisProduct.dom.element.classList.toggle('active');
    });
  }

  initOrderForm(){
    const thisProduct = this;

    // console.log('initOrderForm is on!');

    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.dom.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();

      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;

    // console.log('processOrder is on!');

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    // console.log('formData:', formData); // formData[paramId] --> optionId

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for(let paramId in thisProduct.data.params){
      // determine param value, e.g. paramId = 'toppings, param  = { label: 'Toppings', type: 'checkbox' ... }
      const param = thisProduct.data.params[paramId];
      // console.log(paramId, param);

      // for every option in this category
      for(let optionId in param.options){
        // determine option value
        const option = param.options[optionId];
        // console.log(optionId, option);

        // find image with class '.paramId-optionId
        const image = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);

        // check if optionId includes in formData[paramId]
        if(formData[paramId].includes(optionId)){
          // true
          // check if option has key 'default': true - nothing happends, false - upper the price 
          if(option.default !== true){
            price = price + option.price;
          }

          // add class 'active' (use classNames.menuProduct.imageVisible) to image if this image exsist
          if(image){
            image.classList.add(classNames.menuProduct.imageVisible);
          } 
        } else {
          // false
          // check if option has key 'default': false - nothing happends, true - lower the price 
          if(option.default === true){
            price = price - option.price;
          }

          // remove class 'active' (use classNames.menuProduct.imageVisible) to image if this image exsist 
          if(image){
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    // save single price of product in thisProduct
    thisProduct.priceSingle = price;

    // multiply price by amount
    price *= thisProduct.amountWidget.value;

    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);

    thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){thisProduct.processOrder();});
  }

  addToCart(){
    const thisProduct = this;

    //   app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail:{
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);      
  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {};

    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    productSummary.params = thisProduct.prepareCartProductParams();

    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;

    // set new object
    const productParams = {};
    // console.log('Method prepareCartProductParams');

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);

    // for every category (param)...
    for(let paramId in thisProduct.data.params){
      // determine param value, e.g. paramId = 'toppings, param  = { label: 'Toppings', type: 'checkbox' ... }
      const param = thisProduct.data.params[paramId];
      // console.log(paramId, param);
    
      productParams[paramId] = {
        label: param.label,
        options: {}
      };
    
      // console.log('options:', productParams[paramId]['options']);
    
      // for every option in this category
      for(let optionId in param.options){
        // determine option value
        const option = param.options[optionId];
        // console.log(optionId, option);

        // check if optionId includes in formData[paramId]
        if(formData[paramId].includes(optionId)){
          // true
          productParams[paramId]['options'][optionId] = option.label;
        }
      }
    }

    // return object
    return productParams;
  }

  getElements(){
    const thisProduct = this;

    thisProduct.dom.accordionTrigger = thisProduct.dom.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.dom.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.dom.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.dom.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.dom.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.dom.element.querySelector(select.menuProduct.amountWidget);
  }
}

export default Product;