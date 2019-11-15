$( document ).ready(function() {
    let tag = $.urlParam('tag');
    let url = 'https://api.giphy.com/v1/gifs/random?api_key=VVejTPkeA8kRnzaxPp9IgAsiO5K1caxV&tag=' + tag + '&rating=PG-13';
    $.get( url, function( data ) {
      $('#troll').attr('src', data.data.image_url);
    });
});

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
}
