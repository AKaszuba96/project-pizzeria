import { select, templates } from '../settings.js';
import app from '../app.js';
import Carousel from './Carousel.js';

class Home{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets();
    thisHome.initAction();

  }

  render(element){
    const thisHome = this;

    /* generate HTML code from template */
    const generateHTML = templates.homeWidget();

    /* create object and add to booking page */
    thisHome.dom = {};

    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generateHTML;

    thisHome.dom.orderBox = thisHome.dom.wrapper.querySelector(select.home.orderBox);
    thisHome.dom.bookingBox = thisHome.dom.wrapper.querySelector(select.home.bookingBox);
    thisHome.dom.carouselBox = thisHome.dom.wrapper.querySelector(select.home.carouselBox);
  }

  initAction(){
    const thisHome = this;

    thisHome.dom.orderBox.addEventListener('click', function(event){
      event.preventDefault();

      app.activatePage('order');
      /* change URL hash */
      window.location.hash = '#/order';
    });

    thisHome.dom.bookingBox.addEventListener('click', function(event){
      event.preventDefault();

      app.activatePage('booking');
      /* change URL hash */
      window.location.hash = '#/booking';
    });

  }

  initWidgets(){
    const thisHome = this;

    new Carousel(thisHome.dom.carouselBox);
  }
}

export default Home;