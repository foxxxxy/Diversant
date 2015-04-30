/**
 * Vertical Kangaroo
 * @version 1
 * @author Benton Rochester @im_benton
 * MIT License
 **/

;(function ($, window, document) {
  /**
   * Creates a Accordion.
   * @public
   * @param {HTMLElement|jQuery} element - The element to create accordion.
   * @param {Object} [options] - The options
   */

  Kangaroo = {
    /**
     * Initializes Kangaroo
     */
    init: function(options, el) {
      var base = this;

      // total number of items
      $el = $(el);
      base.options = $.extend({}, $.fn.kangaroo.options, $el.data(), options);

      base.options.$el = $(el);
      base.options.$items = $el.children('ul').children('li');
      base.options.itemsCount = base.options.$items.length

      // current is the index of the opened item
      base.current = this.options.open;
      // save original height and top of each item
      base.saveValues();

      $(window).resize($.proxy(this.onThrottledResize, this));

      this.validate();
      this.bindEvents();
    },

    /**
     * validates open items option
     */
    validate: function() {
      // open must be between -1 and total number of items, otherwise we set it to -1
      if (this.options.open < -1 || this.options.open > this.itemsCount - 1)
        this.options.open = -1;
    },

    /**
     * Checks window `resize` event.
     */
    onThrottledResize: function() {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(this.onResize(this), this.options.refreshRate);
    },

    /**
     * on `resize` event.
     */
    onResize: function() {
      var base = this;

      if( typeof this.options.$item == 'undefined' && base.options.isMobile ) { return };

      // Auto Height all items not open
      $('.pouch').not('.pouch-open').css({height: 'auto'});


      if( this.options.isMobile ) {
        if($(window).width() == base.options.windowWidth ){
          this.updateMobileValues();
        }
      } else {

        this.updateValues();
        if(base.isOpened(base.options.$item)){
          var $content = this.options.$item.find('.kangaroo-content');
          this.open(this.options.$item, $content);
        }
      }

    },

    /**
     * Saves height values
     */
    saveValues: function() {
      var base = this;
      var $firstItem = $('.kangaroo-content').eq(0);
      var carouselHeight = $firstItem.height();

      base.options.$items.each(function(index) {
        var $item = $(this);
        var carouselTop = $item.find('.kangaroo-content').offset().top;

        if( base.options.isMobile || base.options.windowWidth < 608) {
          $item.data({
            originalHeight: $item.find('a:first').outerHeight(true),
            offsetTop: $item.find('.kangaroo-content').offset().top
          });
        } else {
          $item.data({
            originalHeight: $item.find('a:first').outerHeight(true),
            offsetTop: carouselTop - (base.options.windowHeight - carouselHeight)/2
          });
        }
      });
    },

    /**
     * Updates scroll and height values
     */
    updateValues: function() {
      var base = this;
       if (base.current == -1){
          return;
        }

      base.options.windowHeight = $(window).height();
      base.options.windowWidth = $(window).width();

      $('.pouch').not('.pouch-open').css({height: 'auto'});

      base.options.$items.each(function(index, value) {
        var $item = $(this);
        var carouselTop = $item.find('.kangaroo-content').offset().top;
        var carouselHeight = $item.find('.kangaroo-content').height();

        if( index > base.current ){
          if ( base.options.windowWidth > 608 ) {
            $item.data({
              offsetTop: (carouselTop - $item.find('.kangaroo-content').outerHeight(true)) - (base.options.windowHeight - carouselHeight)/2
            });
          } else {
            $item.data({
              originalHeight: $item.find('a:first').outerHeight(true),
              offsetTop: $item.find('.kangaroo-content').offset().top  - $('.pouch.pouch-open').height() + $item.find('a:first').outerHeight(true),
            });
          }
        }
        // Above Opened item
        else {
          if ( base.options.windowWidth > 608 ) {
            $item.data({
              offsetTop: carouselTop - (base.options.windowHeight - carouselHeight)/2
            });
          } else {
            $item.data({
              originalHeight: $item.find('a:first').outerHeight(true),
              offsetTop: $item.find('.kangaroo-content').offset().top
            });
          }
        }

      });
    },

    /**
     * Updates mobile scroll and height values
     */
    updateMobileValues: function() {
      var base = this;
       if (base.current == -1){
          return;
        }

      base.options.windowHeight = $(window).height();

      base.options.$items.each(function(index, value) {
        var $item = $(this);
        var carouselTop = $item.find('.kangaroo-content').offset().top;
        var carouselHeight = $item.find('.kangaroo-content').height();

        if( index > base.current ) {
          $item.data({
            originalHeight: $item.find('a:first').outerHeight(true),
            offsetTop: carouselTop
          });
        }

      });
    },


    /**
     * Bind to Click Events
     */
    bindEvents: function() {

      var instance = this;

      this.options.$items.find('a:first').bind('click.Kangaroo', function(event) {

        var $item = $(this).parent();
        instance.options.$item = $item;

        // close any opened item if oneOpenedItem is true
        if (instance.options.oneOpenedItem && instance.isOpened() && instance.current !== $item.index()) {
          instance.toggleItem(instance.options.$items.eq(instance.current));
        }

        // open / close item
        instance.toggleItem($item);
        return false;
      });
    },

    /**
     * Check which item is opened
     */
    isOpened: function($item) {
      return (this.options.$el.find('li.pouch-open').length > 0);
    },


    /**
     * Toggle Close/Open an item
     */
    toggleItem: function($item) {
      if( !this.options.isMobile ) {
        this.updateValues();
      };

      var $content = $item.find('div.kangaroo-content');
      ($item.hasClass('pouch-open')) ? this.close($item, $content) : this.open($item, $content);

      // Public Event to listen to
      $item.trigger('change');
    },

    /**
     * Open specific Item
     */
    close: function($item, $content) {
        var instance = this;
        this.current = -1,
        $content.stop(true, true),

        $item.removeClass('pouch-open').stop().animate({
          height: $item.data('originalHeight')
        }, instance.options.speed, instance.options.easing, function(){
          $item.find('.kangaroo-content').css({visibility: 'hidden'})
          $item.find('.kangaroo-content').css({visibility: 'hidden'})
          $item.css({height: 'auto'});
          instance.options.closeCallback();
        });
    },

    /**
     * Close specific Item
     */
    open: function($item, $content) {
      var instance = this;
      this.current = $item.index(),
      $content.stop(true, true),
      $item.find('.kangaroo-content').css({visibility: 'visible'});
      $item.addClass('pouch-open').stop().animate({
        height: $item.data('originalHeight') + $content.outerHeight(true)
      }, this.options.speed, this.options.easing, function(){
        instance.options.openCallback();
      }), this.scroll(this);
    },

    /**
    * Close All items
    */
    closeAll: function() {
      var instance = this;
      if($('.pouch.pouch-open')){
        $('.pouch.pouch-open').each(function(i){
          instance.toggleItem($(this));
        });
      }
    },

    /**
     * Close Current item
     */
    closeCurrent: function() {
      this.toggleItem(this.$items.eq(this.current));
    },

    // Open All
    openAll: function() {
      var instance = this;
      $('.pouch-open').each(function(i){
        instance.toggleItem($(this));
      })
    },

    /**
     * scrolls to current item or last opened item if current is -1
     *
     */
    scroll: function(instance) {

      var instance = instance || this,
        current;

      (instance.current !== -1) ? current = instance.current : current = instance.$el.find('li.pouch-open:last').index();

      if(this.options.isMobile){ return; }
      $('html, body').stop().animate({
        scrollTop: (instance.options.oneOpenedItem) ? instance.options.$items.eq(current).data('offsetTop') : instance.options.$items.eq(current).offset().top
      }, instance.options.scrollSpeed, instance.options.scrollEasing);

    },

    /**
     * The jQuery Plugin for the Kangaroo
     * @Log Errors
     */
    logError: function(message) {
      if (this.console) {
        console.error(message);
      }
    }

  };

  /**
   * The jQuery Plugin for the Kangaroo
   * @public
   */
  $.fn.kangaroo = function(options) {
    return this.each(function () {
      if ($(this).data("kangaroo-init") === true) {
          return false;
      }
      $(this).data("knagaroo-init", true);
      // IE8 Poly fill
       if (typeof Object.create != 'function') {
          (function () {
              var F = function () {};
              Object.create = function (o) {
                  if (arguments.length > 1) {
                    throw Error('Second argument not supported');
                  }
                  if (o === null) {
                    throw Error('Cannot set a null [[Prototype]]');
                  }
                  if (typeof o != 'object') {
                    throw TypeError('Argument must be an object');
                  }
                  F.prototype = o;
                  return new F();
              };
          })();
      }
      var kangaroo = Object.create(Kangaroo);
      kangaroo.init(options, this);
      $.data(this, "kangaroo", kangaroo);
    });

  };

  /**
   * Default options for the Accordion
   */
  $.fn.kangaroo.options = {

    open: -1,
    // if set to true, only one item can be opened. Once one item is opened, any other that is opened will be closed first
    oneOpenedItem: true,
    // speed of the open / close item animation
    speed: 600,
    // easing of the open / close item animation
    easing: 'easeOutCubic',
    // speed of the scroll to action animation
    scrollSpeed: 900,
    // easing of the scroll to action animation
    scrollEasing: 'easeOutCubic',
    // Adds Class for Responsive CSS
    responsiveClass: false,
    // Throttled refresh time
    refreshRate: 500,
    // Window Height
    windowHeight: $(window).height(),
    // Window Width
    windowWidth: $(window).width(),
    // Is mobile
    isMobile: false,
    // Called when Kangaroo closes
    closeCallback: $.noop,
    // Called when Kangaroo opens
    openCallback: $.noop

  };


}(jQuery, window, document));

