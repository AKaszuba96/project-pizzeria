class Carousel {
  constructor(element){
    const thisCarousel = this;

    thisCarousel.dom = {};

    thisCarousel.dom.element = element;

    thisCarousel.initPlugin();
  }

  initPlugin(){
    const thisCarousel = this;

    const options = {
      autoPlay: true,
      wrapAround: true,
      prevNextButtons: false,
      freeScroll: false,
      resize: false,
    };

    // eslint-disable-next-line no-undef
    new Flickity(thisCarousel.dom.element, options);
  }
}

export default Carousel;