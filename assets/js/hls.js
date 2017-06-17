var player = videojs('example-video');

$( "#load-playlist" ).click(function( event ) {

  player.src({
    src: $( "#manifest" ).val(),
    type: 'application/x-mpegURL'
  });

  event.preventDefault();
  player.on("loadedmetadata", loadRenditions)

});

$( "#load-rendition" ).click(function( event ) {
    player.tech_.hls.playlists.media(player.tech_.hls.playlists.master.playlists[$( "#renditions" ).val()]);
});

var loadRenditions = function() { 
    currentPlaylist = player.tech_.hls.playlists.media(); 
    var selected 
    for (i = 0; i < player.tech_.hls.playlists.master.playlists.length; i++) { 
        pl = player.tech_.hls.playlists.master.playlists[i]

    	$( "#renditions" ).append($('<option>', {
    		value: i,
    		text: pl.attributes.RESOLUTION.width + "x" + pl.attributes.RESOLUTION.height + ": " + pl.attributes.AUDIO
    	}));

        if (currentPlaylist.uri == pl.resolvedUri) { 
            $( "#renditions option[value="+i+"]").attr('selected','selected');
        }
    }

}
