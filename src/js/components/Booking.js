import { classNames, select, settings, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.renderBookingPage(element);
    thisBooking.initWidgets();
    thisBooking.getData();

  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])    
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentsResponse = allResponses[1];
        const eventsRepeatsResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentsResponse.json(),
          eventsRepeatsResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrents, eventsRepeats]){
        // console.log(bookings);
        // console.log(eventsCurrents);
        // console.log(eventsRepeats);
        thisBooking.parseData(bookings, eventsCurrents, eventsRepeats);
      });
  }

  parseData(bookings, eventsCurrents, eventsRepeats){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrents){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeats){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      } 
    }

    // console.log('booked:', thisBooking.booked);
    
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
    const endHour = startHour + duration;

    for( let hourBlock = startHour; hourBlock < endHour; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    } 
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    // console.log('date and hour:', thisBooking.date, thisBooking.hour);

    let allAvailable = false;

    if(typeof thisBooking.booked[thisBooking.date] == 'undefined'  || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)){
        table.classList.add(classNames.booking.tableBooked);
      } else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  selectTable(event){
    const thisBooking = this;

    event.preventDefault();

    const tableElem = event.target; // nasłuchujemy na całej planszy ale event odnosi się do stolika

    const tableId = tableElem.getAttribute(settings.booking.tableIdAttribute);

    // console.log('thisBooking.selectedTable:', thisBooking.selectedTable);
    // console.log('Id:', tableId);
    // console.log('class:', tableElem.classList.value);

    if(tableElem.classList.value.includes(classNames.booking.tableBooked)){
      alert('Stolik zarezewowany!');
    } else if(thisBooking.selectedTable != 0 && thisBooking.selectedTable != tableId){
      // remove class 'selected' from table whose id is saved in thisBooking.selectedTable
      for(let table of thisBooking.dom.tables){
        if(table.getAttribute(settings.booking.tableIdAttribute) == thisBooking.selectedTable){
          table.classList.remove(classNames.booking.tableSelected);
          break;
        }
      }
      // add class table to tableElem and change thisBooking.selectedTable
      tableElem.classList.add(classNames.booking.tableSelected);
      thisBooking.selectedTable = tableId;
    }else {
      tableElem.classList.toggle(classNames.booking.tableSelected);
      if (tableElem.classList.value.includes(classNames.booking.tableSelected)){
        thisBooking.selectedTable = tableId;
      }else {
        thisBooking.selectedTable = 0;
      }
    }

    // console.log('new thisBooking.selectedTable:', thisBooking.selectedTable);
  }

  unselectTable(){
    const thisBooking = this;

    thisBooking.selectedTable = 0;

    for(let table of thisBooking.dom.tables){
      table.classList.remove(classNames.booking.tableSelected);
    }
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
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.planTables = thisBooking.dom.wrapper.querySelector(select.booking.planTables);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.widgets.formInputs.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.widgets.formInputs.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.widgets.startersPickers);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);

    thisBooking.unselectTable();
  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {};
    
    // change selected table 0 to null
    if(thisBooking.selectedTable == 0){
      thisBooking.selectedTable = null;
    }

    payload.date = thisBooking.date;
    payload.hour = utils.numberToHour(thisBooking.hour);
    payload.table = parseInt(thisBooking.selectedTable);
    payload.duration = thisBooking.hoursAmount.value;
    payload.ppl = thisBooking.peopleAmount.value;
    payload.starters = [];
    payload.phone = thisBooking.dom.phone.value;
    payload.address = thisBooking.dom.address.value;  

    for(let starter of thisBooking.dom.starters){
      if(starter.checked){ // jest zaznaczony
        payload.starters.push(starter.value);
      }
    }

    console.log('booking:', payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };
    
    fetch(url, options);

    thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){});
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){});

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
      thisBooking.unselectTable();
    });

    thisBooking.dom.planTables.addEventListener('click', function(event){
      thisBooking.selectTable(event);
    });

    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();

      // console.log('wychwycono event Booking!');
      thisBooking.sendBooking();
    });
  }
}

export default Booking;