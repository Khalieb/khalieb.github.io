$( document ).ready(function() {
    let tag = $.urlParam('tag');
    let url = 'https://api.giphy.com/v1/gifs/random?api_key=VVejTPkeA8kRnzaxPp9IgAsiO5K1caxV&tag=' + tag + '&rating=PG-13';
    $.get( url, function( data ) {
      let image_url = data.data.image_url;
      let height = data.data.image_height;
      let width = data.data.image_width;
      $('.troll').attr('src', image_url);
      $('.troll-src').attr('content', image_url);
      $('.troll-width').attr('content', width);
      $('.troll-height').attr('content', height);
    });
});

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
}
