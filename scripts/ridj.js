function zeroPad(nr, base) {
  var len = (String(base).length - String(nr).length) + 1;
  return len > 0 ? (new Array(len).join('0') + nr) : nr;
}

function getList(){
  $.ajax({
    url: "http://ridj.herokuapp.com/orders",
    success: function(data) {
      // 리스트 바인딩
      $('.added_list_body').find('tr:not(.structure_row)').remove();
      var structureRow = $('.added_list_body').find('.structure_row').clone().removeClass('structure_row');
      for(var i=0; i<data.orders.length; i++){
        var playTime = calculateTime(data.orders[i].play_time);
        var tmpRow = structureRow.clone();
        tmpRow.find('.song_title').html(data.orders[i].song);
        tmpRow.find('.album_title').html("[ " + data.orders[i].album + " ]");
        tmpRow.find('.artist').html(data.orders[i].artist);
        tmpRow.find('.play_time').html(playTime);
        $('.added_list_body').append(tmpRow);
      };
    }
  });
}

function calculateTime(time){
  var playTime = Number(time);
  return zeroPad(parseInt(playTime/60), 10) + ":" + zeroPad(playTime%60, 10);
}

function search() {
  $(".ridi_songs_tbody").find('tr:not(.structure_row)').remove();

  var version = 1, page = 1, count = 10, searchKeyword = $(".ridi_search_field").val();

  $.ajax({
    url: "http://apis.skplanetx.com/melon/songs?version=" + version + "&page=" + page + "&count=" + count + "&searchKeyword=" + searchKeyword,
    dataType: "json",
    headers: {
      "appKey": "9aefbb17-3d67-3069-a732-e03e4bb3b40c",
      "Accept-Language": "ko",
      "Accept": "application/json",
      "Content-Type": "application/xml; charset=utf-8"
    }
  }).done(function (data) {
    var songs = data.melon.songs.song;
    var structureRow = $('.ridi_songs_tbody').find('.structure_row').clone().removeClass('structure_row');
    for (var i = 0; i < songs.length ; i++) {
      var tmpRow = structureRow.clone();
      
      // 데이터 바인딩
      var songName = songs[i].songName;
      var artistName = songs[i].artists.artist[0].artistName;
      var albumName = songs[i].albumName;
      var playTime = calculateTime(songs[i].playTime);
      tmpRow.find('.song_name').html(songName).attr('id', 'song-' + i);
      tmpRow.find('.album_name').html("[" + albumName + " ]").attr('id', 'album-' + i);
      tmpRow.find('.artist_name').html(artistName).attr('id', 'artist-' + i);
      tmpRow.find('.play_time').html(playTime).attr('id', 'play-time-' + i).val(songs[i].playTime);
      tmpRow.find('.ridi_add_button').attr('id', 'button-' + i);
      $(".ridi_songs_tbody").append(tmpRow);

      // 추가 버튼 액션
      $("#button-" + i).on("click", function () {
        var index = this.id.replace("button-", "");
        songName = $("#song-" + index).text();
        artistName = $("#artist-" + index).text();
        albumName = $("#album-" + index).text();
        playTime = $("#play-time-" + index).val();

        var requestData = "song=" + songName + "&artist=" + artistName + "&album=" + albumName + "&play_time=" + playTime;
        $.ajax({
          url: "http://ridj.herokuapp.com/api/orders/new",
          dataType: "json",
          method: "POST",
          data: requestData,
          beforeSend: function () {
            $(".modal-spinner").css("display", "table-cell");
          }
        }).done(function (data) {
          $(".modal-spinner").css("display", "none");
          alert("곡이 신청되었습니다.");
          clearSearch();
          getList();
        });
      });
    }
  });
}

function clearSearch() {
  $(".ridi_search_field").val("");
  $(".ridi_songs_tbody").find('tr:not(.structure_row)').remove();
  $(".searching_area").removeClass("on");
}

$(function () {
  $(".ridi_search_field").focus(function() {
    $('.searching_area').addClass("on");
  });
  $(".searching_area").click(function() {
    if($(event.target).is(".searching_area.on")) {
      clearSearch();
    }
  });
  $(".search_input_wrap .clear_button").click(clearSearch);

  $(".ridi_search_field").on("keypress", function (e) {
    if (e.which == 13) {
      search();
    }
  });
  
  getList();
});