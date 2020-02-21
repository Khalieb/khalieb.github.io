/*! @name videojs-thumbnail-scrubbing @version 0.0.0 @license UNLICENSED */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('global/window'), require('video.js')) :
  typeof define === 'function' && define.amd ? define(['global/window', 'video.js'], factory) :
  (global = global || self, global.videojsThumbnailScrubbing = factory(global.window, global.videojs));
}(this, function (window, videojs) { 'use strict';

  window = window && window.hasOwnProperty('default') ? window['default'] : window;
  videojs = videojs && videojs.hasOwnProperty('default') ? videojs['default'] : videojs;

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var Component = videojs.getComponent('Component');
  /**
  * A Component to display a thumbnail image as the user hovers over the progress bar
  *
  * @extends Component
  */

  var ThumbnailDisplay =
  /*#__PURE__*/
  function (_Component) {
    _inheritsLoose(ThumbnailDisplay, _Component);

    function ThumbnailDisplay(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;
      _this.setThumbnailImage = _this.setThumbnailImage.bind(_assertThisInitialized(_this));
      return _this;
    }

    var _proto = ThumbnailDisplay.prototype;

    _proto.createEl = function createEl() {
      console.log('creating');
      var el = _Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-thumbnail-display'
      });

      this.imageEl_ = videojs.dom.createEl('img', {
        className: 'vjs-thumbnail-image',
        style: 'display: none;'
      });
      el.appendChild(this.imageEl_);
      return el;
    };
    

    _proto.setThumbnailImage = function setThumbnailImage(src) {
      var _this2 = this;

      if (!src) {
        return;
      }

      this.imageEl_.onload = function () {
        // make sure the image element is hidden if image dimensions are unavailable
        if (!_this2.imageEl_.naturalWidth || !_this2.imageEl_.naturalHeight) {
          _this2.imageEl_.style.display = 'none';
          return;
        }

        var aspectRatio = _this2.imageEl_.naturalWidth / _this2.imageEl_.naturalHeight; // set the thumbnail container height based on the aspect ratio of the image,
        // while maintaining a consistent width of 150px

        _this2.el_.style.height = Math.round(150 / aspectRatio) + "px"; // if the image was previously hidden, either by default before the first
        // image loaded or because the previous thumbnail was invalid, show it now
        // that we have loaded one successfully

        if (_this2.imageEl_.style.display === 'none') {
          _this2.imageEl_.style.display = 'block';
        }
      };

      this.imageEl_.onerror = function () {
        _this2.imageEl_.style.display = 'none';
      };

      this.imageEl_.src = src;
    };

    _proto.updatePosition = function updatePosition() {
      var mouseTimeDisplay = this.player_.getChild('ControlBar').getChild('ProgressControl').getChild('SeekBar').getChild('MouseTimeDisplay');
      var mouseTimeDisplayRect = videojs.dom.getBoundingClientRect(mouseTimeDisplay.el());
      var playerRect = videojs.dom.getBoundingClientRect(this.player_.el());
      var imageContainerRect = videojs.dom.getBoundingClientRect(this.el_); // the default adjustment width is half the width of the thumbnail so it will
      // center on the MouseTimeDisplay

      var adjustmentWidth = imageContainerRect.width / 2;

      if (mouseTimeDisplayRect.right + adjustmentWidth > playerRect.right) {
        adjustmentWidth -= mouseTimeDisplayRect.right + adjustmentWidth - playerRect.right;
      } else if (mouseTimeDisplayRect.left - adjustmentWidth < playerRect.left) {
        adjustmentWidth -= mouseTimeDisplayRect.left - adjustmentWidth - playerRect.left;
      }

      this.el_.style.right = "-" + adjustmentWidth + "px";
    };

    return ThumbnailDisplay;
  }(Component);
  Component.registerComponent('ThumbnailDisplay', ThumbnailDisplay);

  var version = "0.0.0";

  // - very odd aspect ratios
  // - very large thumbnail images (DONE - it's laggy)
  // - very small thumbnail images (DONE - it scales to fit, blurry)
  // - failed iage request / image doesn't exist (DONE - shows black frame, hides img shows the container)
  // - time gaps in VTT (DONE - shows last valid frame, or black frame w/ white border because of the
  //   no img detected styling - fixed the border by hiding the img before first one loads)
  // - slow network (DONE - should we show previous thumbnail until current one has loaded,
  //   or a black frame? showing black frame makes scrubbing under normal conditions more clunky)
  // SOLVE POSITIONING ISSUE ON FIRST MOUSEMOVE
  // - it jumps from the far left of the player, then has right: -150px, before it re-centers
  // NEXT
  // - source changes handling
  // - dispose() handling and other lifecycle issues
  // - test on mobile and IE/Edge

  var Plugin = videojs.getPlugin('plugin');
  /**
   * Wraps the given function, `fn`, with a new function that only invokes `fn`
   * at most once per every `wait` milliseconds.
   *
   * @function
   * @param    {Function} fn
   *           The function to be throttled.
   *
   * @param    {number}   wait
   *           The number of milliseconds by which to throttle.
   *
   * @return   {Function}
   */

  var throttle = function throttle(fn, wait) {
    var last = window.performance.now();

    var throttled = function throttled() {
      var now = window.performance.now();

      if (now - last >= wait) {
        fn.apply(void 0, arguments);
        last = now;
      }
    };

    return throttled;
  }; // Default options for the plugin.


  var defaults = {};
  /**
   * An advanced Video.js plugin. For more information on the API
   *
   * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
   */

  var ThumbnailScrubbing =
  /*#__PURE__*/
  function (_Plugin) {
    _inheritsLoose(ThumbnailScrubbing, _Plugin);

    /**
     * Create a ThumbnailScrubbing plugin instance.
     *
     * @param  {Player} player
     *         A Video.js Player instance.
     *
     * @param  {Object} [options]
     *         An optional options object.
     *
     *         While not a core part of the Video.js plugin architecture, a
     *         second argument of options is a convenient way to accept inputs
     *         from your plugin's caller.
     */
    function ThumbnailScrubbing(player, options) {
      var _this;

      // the parent class will add player under this.player
      _this = _Plugin.call(this, player) || this;
      _this.options = videojs.mergeOptions(defaults, options);
      _this.currentThumbnail_ = null;

      _this.player.ready(function () {
        _this.player.addClass('vjs-thumbnail-scrubbing'); // the URL of the thumbnail VTT file is passed via the source object


        _this.options.thumbnails = _this.player.currentSource().thumbnails; // TO DO: validate that thumbnails URL points to .vtt file

        if (_this.options.thumbnails) {
          _this.metadataTrackEl_ = _this.getThumbnailVTT(_this.options.thumbnails);

          _this.metadataTrackEl_.addEventListener('load', function () {
            if (!(_this.metadataTrackEl_.track && _this.metadataTrackEl_.track.cues && _this.metadataTrackEl_.track.cues.length)) {
              videojs.log.warn('Unable to parse cues out of thumbnail vtt file.');
              return;
            }

            _this.setupThumbnailScrubbing();
          });
        }
      });

      return _this;
    } // this needs to be async on all platforms


    var _proto = ThumbnailScrubbing.prototype;

    _proto.getThumbnailVTT = function getThumbnailVTT(thumbnailsUrl) {
      // Since the thumbnail URLs and timing info are contained within a .vtt file
      // we can take advantage of the WebVTT API to store the information in a
      // metadata track
      var metadataTrack = this.player.addRemoteTextTrack({
        src: thumbnailsUrl,
        kind: 'metadata',
        mode: 'hidden'
      }, true); // On Safari, we need to manually enable the native text track so the cues populate

      if (videojs.browser.IS_ANY_SAFARI) {
        metadataTrack.track.mode = 'hidden';
      }

      return metadataTrack;
    };

    _proto.setupThumbnailScrubbing = function setupThumbnailScrubbing() {
      var mouseTimeDisplay = this.player.getChild('ControlBar').getChild('ProgressControl').getChild('SeekBar').getChild('MouseTimeDisplay'); // Make the ThumbnailDisplay a child of MouseTimeDisplay, so that it will
      // adjust horizontal position along with the time tooltip

      this.thumbnailComponent_ = mouseTimeDisplay.addChild('ThumbnailDisplay');
      var progressControlEl = this.player.getChild('ControlBar').getChild('ProgressControl').el(); // throttle the mousemove handler with the same wait time as the MouseTimeDisplay
      // mousemove handler

      this.on(progressControlEl, 'mousemove', throttle(this.handleMouseMove.bind(this), 30));
    };

    _proto.handleMouseMove = function handleMouseMove(event) {
	  const seekBar = player.controlBar.progressControl.seekBar;
	  const seekBarEl = seekBar.el();
      const seekBarRect = videojs.dom.getBoundingClientRect(seekBarEl);
      let seekBarPoint = videojs.dom.getPointerPosition(seekBarEl, event).x;
      this.updateThumbnailImageAndPosition(seekBarPoint);
    } // Check if we have a thumbnail for the current hover position, load it and update
    // the thumbnail's position in the player if near an edge
    ;

    _proto.updateThumbnailImageAndPosition = function updateThumbnailImageAndPosition(seekBarPoint) {
      var time = seekBarPoint * this.player.duration();

      if (this.metadataTrackEl_.track.cues) {
        for (var i = 0; i < this.metadataTrackEl_.track.cues.length; i++) {
          var cue = this.metadataTrackEl_.track.cues[i];

          if (time >= cue.startTime && time <= cue.endTime && cue.text !== this.currentThumbnail_) {
            this.thumbnailComponent_.setThumbnailImage(cue.text);
            this.currentThumbnail_ = cue.text;
          }
        }

        this.thumbnailComponent_.updatePosition();
      }
    };

    return ThumbnailScrubbing;
  }(Plugin); // Define default values for the plugin's `state` object here.


  ThumbnailScrubbing.defaultState = {}; // Include the version number.

  ThumbnailScrubbing.VERSION = version; // Register the plugin with video.js.

  videojs.registerPlugin('thumbnailScrubbing', ThumbnailScrubbing);

  return ThumbnailScrubbing;

}));
