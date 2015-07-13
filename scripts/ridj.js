function zeroPad(nr, base) {
  var len = (String(base).length - String(nr).length) + 1;
  return len > 0 ? (new Array(len).join('0') + nr) : nr;
}

function getList(){
  $.ajax({
    url: "http://ridj.herokuapp.com/orders",
    success: function(data, structureRow) {
      for(var i=0; i<data.orders.length; i++){
        var playTime = Number(data.orders[i].play_time);
        var tmpRow = $('.structure_row').clone().removeClass('structure_row');
        tmpRow.find('.album_title').html(data.orders[i].album);
        tmpRow.find('.song_title').html(data.orders[i].song);
        tmpRow.find('.artist').html(data.orders[i].artist);
        tmpRow.find('.play_time').html(parseInt(playTime/60) + "분 " + (playTime%60) + "초");
        $('.added_list_body').append(tmpRow);
      };
    }
  });
}

function search() {
  $(".ridi-songs-result").remove();
  $('.ridi-songs-table').show();

  var version = 1, page = 1, count = 10, searchKeyword = $(".ridi-search-field").val();

  if(searchKeyword == ""){
    $('.ridi-songs-table').hide();    
  }

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
    for (var i = 0; i < songs.length ; i++) {
      var songName = songs[i].songName;
      var artistName = songs[i].artists.artist[0].artistName;
      var albumName = songs[i].albumName;
      var playTime = songs[i].playTime;
      $(".ridi-songs-tbody").append(
        "<tr class='ridi-songs-result'>" +
        "<td class='mdl-data-table__cell--non-numeric' id='song-" + i + "'>" + songName +"</td>" +
        "<td class='mdl-data-table__cell--non-numeric' id='artist-" + i + "'>" + artistName +"</td>" +
        "<td class='mdl-data-table__cell--non-numeric' id='album-" + i + "'>" + albumName +"</td>" +
        "<td class='mdl-data-table__cell--non-numeric' id='play-time-" + i + "'>" + playTime +"</td>" +
        "<td class='mdl-data-table__cell--non-numeric'><button class='ridi-add-button mdl-button mdl-js-button mdl-button--icon mdl-button--accent' id='button-" + i + "'><i class='material-icons'>add</i></button></td>" +
        "</tr>"
      );
      $("#button-" + i).on("click", function () {
        var index = this.id.replace("button-", "");
        songName = $("#song-" + index).text();
        artistName = $("#artist-" + index).text();
        albumName = $("#album-" + index).text();
        playTime = $("#play-time-" + index).text();

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
        });
      });
    }
  });
}

$(function () {
  $(".ridi-search-field").on("keypress", function (e) {
    if (e.which == 13) {
      search();
    }
  });
  
  $(".ridi-search-button").on("click", search);
  getList();
});