// 값 관련 함수들
function zeroPad(nr, base) {
  var len = (String(base).length - String(nr).length) + 1;
  return len > 0 ? (new Array(len).join('0') + nr) : nr;
}

function calculateTime(time){
  var playTime = Number(time);
  return zeroPad(parseInt(playTime/60), 10) + ":" + zeroPad(playTime%60, 10);
}

function makeCoverSrc(idValue){
  var idString = ("" + idValue);
  var idLength = idString.length;
  var firstQuery = zeroPad(idString.substring(0, idLength - 5), 100);
  var secondQuery = idString.substring(idLength - 5, idLength - 3);
  var thirdQuery = idString.substring(idLength - 3, idLength);
  return "http://image.melon.co.kr/cm/album/images/" + firstQuery + "/" + secondQuery + "/" + thirdQuery + "/" + idValue + ".jpg";
}

// 검색창 초기화 함수
function clearSearch() {
  $(".ridi_search_field").val("");
  $(".ridi_songs_tbody").find('tr:not(.structure_row)').remove();
  $(".searching_area").removeClass("on");
}

// 리스트 가져오는 함수
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
        if(data.orders[i].cover_src == "" || data.orders[i].cover_src == undefined || data.orders[i].cover_src == null) {
          tmpRow.find('.cover_column').addClass("image_null");
          tmpRow.find('.cover_column').html("<span class='icon-sad'></span><p>No Image</p>");
        }
        else {
          tmpRow.find('.album_cover').attr('src', data.orders[i].cover_src);
        }
        tmpRow.find('.song_title').html(data.orders[i].song);
        tmpRow.find('.album_title').html("[ " + data.orders[i].album + " ]");
        tmpRow.find('.artist').html(data.orders[i].artist);
        tmpRow.find('.play_time').html(playTime);
        $('.added_list_body').append(tmpRow);
      }
    }
  });
}

// 검색 함수
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
      var imgSrc = makeCoverSrc(songs[i].albumId);
      var songId = songs[i].songId;
      var albumId = songs[i].albumId;
      var artistId = songs[i].artists.artist[0].artistId;
      tmpRow.find('.album_cover').attr('src', imgSrc);
      tmpRow.find('.song_name').html(songName);
      tmpRow.find('.album_name').html(albumName);
      tmpRow.find('.artist_name').html(artistName);
      tmpRow.find('.play_time').html(playTime).val(songs[i].playTime);
      tmpRow.find('.ridi_add_button').attr('id', 'button-' + i);
      tmpRow.attr('id', 'list-' + i).attr('song_id', songId).attr('album_id', albumId).attr('artist_id', artistId);

      $(".ridi_songs_tbody").append(tmpRow);

      // 추가 버튼 액션
      $("#button-" + i).on("click", function () {
        var index = this.id.replace("button-", "");
        var addedTarget = $('#list-' + index);
        songName = addedTarget.find('.song_name').text();
        artistName = addedTarget.find('.artist_name').text();
        albumName = addedTarget.find('.album_name').text();
        playTime = addedTarget.find('.play_time').val();
        songId = addedTarget.attr('song_id');
        albumId = addedTarget.attr('album_id');
        artistId = addedTarget.attr('artist_id');
        coverSrc = addedTarget.find('.album_cover').attr('src');

        var requestData = "song=" + songName + "&artist=" + artistName + "&album=" + albumName + "&play_time=" + playTime;
        requestData += "&song_id=" + songId + "&album_id=" + albumId + "&artist_id=" + artistId + "&cover_src=" + coverSrc;
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
