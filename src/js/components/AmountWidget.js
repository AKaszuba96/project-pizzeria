import {settings, select} from './settings.js';

class AmountWidget{
  constructor(element){
    const thisWidget = this;

    // console.log('AmountWidget:', thisWidget);
    // console.log('Constructor element:', element);

    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
  }

  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);
    
    if(!(isNaN(newValue)) && newValue !== thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
      thisWidget.value = newValue;
      thisWidget.announce();
    }
    
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){thisWidget.setValue(thisWidget.dom.input.value);});
    
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  announce(){
    const thisWidget = this;

    // Create new event by class Event!! 
    const event = new CustomEvent('updated', {
      bubbles: true // dodanie bąbelkowania - ułatwia dostęp do zmian w koszyku
    });
    
    thisWidget.dom.element.dispatchEvent(event);
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.element = element;
    thisWidget.dom.input = thisWidget.dom.element.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.element.querySelector(select.widgets.amount.linkIncrease);
  }
}

export default AmountWidget;