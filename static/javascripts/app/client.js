global.jQuery = require('jquery');
global.$ = global.jQuery;
global.moment = require('moment');
require('../libs/moment.lang_ja');
require('jquery-ui');
require('bootstrap');
require('jquery-colorbox');
require('../libs/livestamp');
require('../libs/jquery.autosize');
require('perfect-scrollbar/jquery')($);

// knockout.js
var ko = require('knockout');
ko.mapping = require('knockout.mapping');
require('../libs/knockout.devhub_custom')(ko);

var FaviconNumber = require('../libs/favicon-number');
var Flipsnap = require('flipsnap');

// ViewModels
var SettingViewModel = require('./setting_view_model');
var MemoController   = require('./memo_controller');
var ChatController   = require('./chat_controller');

function ClientViewModel(param){
  var that = this;

  this.socket = param.socket;
  this.is_mobile = false;
  this.flipsnap = null;

  this.faviconNumber = new FaviconNumber();

  this.settingViewModel = new SettingViewModel({
    socket: that.socket
  });

  this.memoController = new MemoController({
    socket: that.socket,
    settingViewModel: that.settingViewModel,
    setMessage: function(message, force){
      that.chatController.setMessage(message, force);
    },
    zenMode: function(){
      return that.zenMode;
    }
  });

  this.chatController = new ChatController({
    socket: that.socket,
    faviconNumber: that.faviconNumber,
    showRefPoint: function(id){
      that.memoController.move(id);
    },
    doNotification: that.settingViewModel.doNotification,
    settingViewModel: that.settingViewModel
  });

  this.settingViewModel.loginName.subscribe(function(value){
    that.chatController.setName(value);
    that.memoController.setName(value);
  });

  this.zenMode = false;

  this.init = function(){
    that.init_websocket();
    that.settingViewModel.init();
    init_display();
  }

  var init_display = function(){
    if ($(window).width() < 768){
      that.is_mobile = true;
    }

    // for smartphone
    // 本当は bootstrap-responsive のみやりたいが、perfectScrollbar の制御は
    // js側でやらないといけないので解像度で切り分ける
    if (!that.is_mobile){
      that.switch_to_normal();
    }else{
      that.switch_to_flipsnap(0);
    }

    if ( that.settingViewModel.loginName() == null){
      setTimeout(function(){
        $('#name_in').modal("show");
        setTimeout(function(){
          $('#login_name').focus();
        },500);
      },500);
    }else{
      that.chatController.setName(that.settingViewModel.loginName());
      that.memoController.setName(that.settingViewModel.loginName());
    }

    // ショートカットキー
    $(document).on("keyup", function (e) {
      if (e.keyCode == 27){ // ESC : blur and return fullscreen mode.
        var focusedDom = $(':focus');
        if (focusedDom.length != 0 ){
          focusedDom.blur();
        }
        that.zenMode = false;
        that.switch_to_normal();
      } else if ($(':focus').length == 0 ){
        if(e.shiftKey){
          if(e.keyCode == 72){         // Shift + h: select prev chat room
            that.chatController.prev();
          }else if (e.keyCode == 76){  // Shift + l: select prev chat room
            that.chatController.next();
          } else if (e.keyCode == 87){  // Shift + w : wip reverse jump
            that.memoController.wipReverseJump();
          } else if (e.keyCode == 52){ // $: move bottom share memo
            that.memoController.bottom();
          }
        }else{
          if (e.keyCode == 67){        // c : focus chat field
            that.chatController.focus();
          } else if (e.keyCode == 77){ // m : focus current memo form
            that.memoController.setFocus();
          } else if (e.keyCode == 72){ // h: select prev share memo
            that.memoController.prev();
          } else if (e.keyCode == 76){ // l: select next share memo
            that.memoController.next();
          } else if (e.keyCode == 48){ // 0: move top share memo
            that.memoController.top();
          } else if (e.keyCode == 74){ // j: move down share memo
            that.memoController.down();
          } else if (e.keyCode == 75){ // k: move down share memo
            that.memoController.up();
          } else if (e.keyCode == 190){ // .: go to next unread room
            that.chatController.goToUnread();
          } else if (e.keyCode == 113){ // F2 : focus current memo form
            that.memoController.setFocus();
          } else if (e.keyCode == 87){  // w : wip jump
            that.memoController.wipJump();
          } else if (e.keyCode == 84){  // t : task jump
            that.memoController.taskJump();
          }
        }
      } else if (e.keyCode == 113){ // F2 : focus current memo form
        that.memoController.setFocus();
      }
    });

    $('a[rel=tooltip]').tooltip({
      placement : 'bottom'
    });

    $('#settings_modal').modal({
      backdrop: true,
      show: false
    });
  }

  this.init_websocket = function(){
    that.socket.on('connect', function() {
      that.settingViewModel.set_avatar();
    });

    that.socket.on('disconnect', function(){
      console.log('disconnect');
    });

    that.socket.on('set_name', function(name) {
      that.settingViewModel.loginName(name);
    });
  }

  this.showChat = function(){
    $('#chat_area').scrollTop(0);
    $('#index_inner').hide();
    $('#calendar_inner').hide();
    $('#chat_inner').fadeIn(function(){
      $('#message').trigger('autosize.resize').focus();
    });
  }

  this.fullscreen_both = function(){
    this.zenMode = true;
    $(".navbar").fadeOut();
    $(".dummy-top-space").fadeOut();
    $("#memo_area").trigger("scroll");
  }

  this.fullscreen_memo = function(){
    this.zenMode = true;
    this.memoController.top();
    this.switch_to_flipsnap(1);
  }

  this.fullscreen_chat = function(){
    this.zenMode = true;
    this.switch_to_flipsnap(0);
  }

  this.showSetting = function(){
    $('#settings_modal').modal('show');
  }

  this.switch_to_normal = function(){
    // 全画面モードを解除
    $('.hidden-phone').show();
    $('.visible-phone').hide();
    $('.text-date').show();
    $('.checkbox-count').show();

    $(window).unbind('resize');

    that.un_adjust_display_size_for_mobile();

    // ノーマルスタイルを設定
    $('body').addClass("perfect-scrollbar-body-style");

    var scrollOption = {
      wheelSpeed: 1,
      useKeyboard: true,
      suppressScrollX: true
    };

    $('#chat_area').addClass("perfect-scrollbar-style");
    $('#chat_area').perfectScrollbar(scrollOption);
    $('#memo_area').addClass("perfect-scrollbar-style");
    $('#memo_area').perfectScrollbar(scrollOption);
  }

  this.switch_to_flipsnap = function(point){
    // ノーマルスタイルを解除
    $('body').removeClass("perfect-scrollbar-body-style");

    $('#chat_area').removeClass("perfect-scrollbar-style");
    $('#chat_area').perfectScrollbar('destroy');
    $('#memo_area').removeClass("perfect-scrollbar-style");
    $('#memo_area').perfectScrollbar('destroy');

    // 全画面モードを設定
    $('.hidden-phone').hide();
    $('.visible-phone').show();
    $('.text-date').hide();
    $('.checkbox-count').hide();

    // フリック用のサイズ調整
    that.adjust_display_size_for_mobile();
    that.flipsnap.moveToPoint(point);

    $(window).resize(function(){
      that.adjust_display_size_for_mobile();
    });
  }

  this.adjust_display_size_for_mobile = function(){
    // フリック用のサイズ調整
    var window_width = $(window).width();
    $('.viewport').css('width',window_width + 'px').css('overflow','hidden').css('padding',0);
    $('.flipsnap').css('width',window_width * 2 + 'px');

    that.chatController.setWidth(window_width);
    that.memoController.setWidth(window_width);
    if (that.flipsnap == null){
      if (that.is_mobile){
        that.flipsnap = Flipsnap('.flipsnap');
      }else{
        that.flipsnap = Flipsnap('.flipsnap', { disableTouch: true, disable3d: true });
      }
    }
    that.flipsnap.refresh();
  }

  this.un_adjust_display_size_for_mobile = function(){
    // フリック解除
    if (that.flipsnap != null){
      that.flipsnap.destroy();
      that.flipsnap = null;
    }

    that.chatController.unSetWidth();
    that.memoController.unSetWidth();

    $('.viewport').removeAttr('style');
    $('.flipsnap').removeAttr('style');
  }

}

$(function() {
  var socket = require('socket.io-client')('/', {query: 'from=devhub'});

  var clientViewModel = new ClientViewModel({
    socket: socket
  });
  ko.applyBindings(clientViewModel);
  clientViewModel.init();
});
