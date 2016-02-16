var COOKIE_NAME = "dev_hub_name";

$(function() {
  var name = $.cookie(COOKIE_NAME);
  emojify.setConfig({
    img_dir: 'img/emoji',  // Directory for emoji images
  });

  // スクロールバーの設定
  var scrollOption = {
    wheelSpeed: 1,
    useKeyboard: false,
    suppressScrollX: true
  };

  $('body').addClass("perfect-scrollbar-body-style");
  $('#blog_area').addClass("perfect-scrollbar-style");
  $('#blog_area').perfectScrollbar(scrollOption);
  $('#index_area').addClass("perfect-scrollbar-style");
  $('#index_area').perfectScrollbar(scrollOption);

  var blogViewModel = new BlogViewModel(
    name,
    function(){
      $('#loading').fadeIn('fast');
    },
    function(){
      $('#loading').fadeOut();
    });

  ko.applyBindings(blogViewModel);

  // ViewとViewModelをバインド
  $('#blog_form').autosize();

  $("#save_btn").click(function(){
    blogViewModel.add();
    $('#blog_form').trigger('autosize.resize');
  })

  function moveSearchIndex(offset_top){
    var target_top = offset_top;
    var base_top = $("#index_list").offset().top;
    $('#index_area').scrollTop(target_top - base_top - $(window).height()/2 + 54);
  }

  function moveSearchLine(offset_top){
    var target_top = offset_top;
    var base_top = $("#blog_list").offset().top;
    $('#blog_area').scrollTop(target_top - base_top - $(window).height()/2 + 54 );
  }

  /*
  $.templates("#blogNaviTmpl").link("#blog_navi", blogViewModel)
    .on('keyup', ".search-query", function(event){
        if($(this).val() != ""){
          $("#search_clear").show();
        }else{
          $("#search_clear").hide();
        }
    })
    .on("click", "#search_clear", function(){
      $(this).hide();
      $(".search-query").val("");
      blogViewModel.search();
    })
    .on("click", "#prev_match", function(){
      blogViewModel.prev(function(index_top, blog_top){
        moveSearchIndex(index_top);
        moveSearchLine(blog_top);
      });
      return false;
    })
    .on("click", "#next_match",function(){
      blogViewModel.next(function(index_top, blog_top){
        moveSearchIndex(index_top);
        moveSearchLine(blog_top);
      });
      return false;
    })
    .on("click", "#scroll_top", function(){
      $('#blog_area').animate({ scrollTop: 0 }, 'fast');
      $('#index_area').animate({ scrollTop: 0 }, 'fast');
      return false;
    });
    */

  $.templates("#tagListTmpl").link("#tag_list", blogViewModel.tags)
    .on("click", ".tag-name", function(){
      var tag = $(this).data("tag");
      blogViewModel.search_by_tag(tag);
      $('#tags_modal').modal('hide');
    });

  $.templates("#blogBodyTmpl").link("#blog_list", blogViewModel.items)
    .on("click",".edit-blog", function(){
      blogViewModel.edit($.view(this));
    })
    .on("click",".update-notify-blog", function(){
      blogViewModel.update($.view(this), true);
    })
    .on("click",".update-blog", function(){
      blogViewModel.update($.view(this));
    })
    .on("click",".cancel-edit", function(){
      blogViewModel.cancel($.view(this));
    })
    .on("click",".remove-blog", function(){
      if (!window.confirm('Are you sure?')){
        return true;
      }

      blogViewModel.destory($.view(this));
    })
    .on("click", ".tag-name", function(){
      var tag = $(this).data("tag");
      blogViewModel.search_by_tag(tag);
    })
    .on('keydown','.edit-area',function(event){
      // Ctrl - S or Ctrl - enter
      if ((event.ctrlKey == true && event.keyCode == 83) ||
        (event.ctrlKey == true && event.keyCode == 13)) {
        $(this).blur(); //入力を確定するためにフォーカス外す
        blogViewModel.update($.view(this));
        return false;
      }
    })
    .on('inview', '.blog-body:last-child', function(event, isInView, visiblePartX, visiblePartY) {
      blogViewModel.load_more();
    });

  $.templates("#blogIndexTmpl").link("#index_list", blogViewModel.items)
    .on("click",".index-body-link", function(){
      $target = $("#" + $(this).data('id'));
      var target_top = $target.offset().top;
      var base_top = $("#blog_list").offset().top;
      $('#blog_area').scrollTop(target_top - base_top + 38);
      blogViewModel.toggleIndexes($.view(this));
    })
    .on("click",".index-li", function(){
      var index = $(this).closest(".index-ul").find(".index-li").index(this);
      var id = $(this).closest(".index-ul").data("id");
      var $code_out = $('#' + id);
      var pos = $code_out.find(":header").eq(index + 1).offset().top - $('#blog_list').offset().top;
      $('#blog_area').scrollTop(pos + 42);
      return true;
    })
    .on("click", ".tag-name", function(){
      var tag = $(this).data("tag");
      blogViewModel.search_by_tag(tag);
    })
    .on('inview', '.index-body:last-child', function(event, isInView, visiblePartX, visiblePartY) {
      blogViewModel.load_more();
    });

  // 初期リスト読み込み
  blogViewModel.refresh();
});
