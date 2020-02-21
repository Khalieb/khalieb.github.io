var player = videojs('example-video');

$( "#load-playlist" ).click(function( event ) {

  player.src({
    //src: $( "#manifest" ).val(),
    src: "http://manifest.qa.boltdns.net/manifest/v1/hls/v4/clear/cwelsh/bb2cc9b7-d524-461f-8b42-5010e76f4b36/10s/master.m3u8?behavior_id=b1acb69f-2bc0-4ac6-9577-4630cc30fde8&fastly_token=NWU3NDAzMjJfMGVmY2QyY2U0OTg0NGNlMDY1NzRmNDRkZThmMDU0YmNmNTQ4NzU5ZDA0MzYzNWI4MTY4MzJkZTU4Yjk1ZjkyZQ%3D%3D",
    type: 'application/x-mpegURL'
  });

  var thumbnails = $("#thumbnails").val()
  thumbnails = "http://manifest.qa.boltdns.net/thumbnail/v1/cwelsh/bb2cc9b7-d524-461f-8b42-5010e76f4b36/3286af81-794b-4b3d-8220-645bba7dba65/thumbnail.webvtt?behavior_id=b1acb69f-2bc0-4ac6-9577-4630cc30fde8&fastly_token=NWU3NDAzMjJfMGMxY2JmMDhiMzBhNDM1ZGY3YjVjNWMwMWYxNThhMTliODVhYTBhNDc4OTY2OGVjOTVlOGNjMWEwMzlmOTkzMA%3D%3D"
  if (thumbnails != "") { 
	player.addRemoteTextTrack({kind: "metadata", src: thumbnails, mode: 'hidden'}, true);
	player.thumbnails({ width: 120, height: 90 });
  }

  event.preventDefault();
  player.on("loadedmetadata", loadRenditions)

});

$( "#load-rendition" ).click(function( event ) {
    pl = player.tech_.hls.playlists.master.playlists[$( "#renditions" ).val()]

    player.tech_.hls.representations().forEach(function(rep) {
        if (rep.bandwidth != pl.attributes.BANDWIDTH) { 
            rep.enabled(false)
        } else { 
            rep.enabled(true)
        }       
    });

    player.tech_.hls.playlists.media(pl);
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
    $('.selectpicker').selectpicker('refresh');
}
