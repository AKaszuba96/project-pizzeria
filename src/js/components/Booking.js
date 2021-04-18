import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';


class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.renderBookingPage(element);
    thisBooking.initWidgets();

  }

  renderBookingPage(element){
    const thisBooking = this;

    /* generate HTML code from template */
    const generateHTML = templates.bookingWidget();

    /* create object and add to booking page */
    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generateHTML;

    /* create references to elements on page */
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){});
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){});

  }
}

export default Booking;