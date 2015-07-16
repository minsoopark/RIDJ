var datas = {
  searchPage: 1,
  searchKeyword: ""
}

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
  var padded = zeroPad(idString, 10000000);
  var idLength = padded.length;
  var firstQuery = padded.substring(0, idLength - 5);
  var secondQuery = padded.substring(idLength - 5, idLength - 3);
  var thirdQuery = padded.substring(idLength - 3, idLength);
  return "http://image.melon.co.kr/cm/album/images/" + firstQuery + "/" + secondQuery + "/" + thirdQuery + "/" + idValue + ".jpg";
}

// 검색창 열기 함수
function openSearch() {
  $(".searching_trigger").addClass("on");
  $('.searching_area').addClass("on");
  setTimeout(function(){$('#song').focus()}, 400);
}

// 검색창 닫기 함수
function clearSearch() {
  $(".ridi_search_field").val("");
  $(".ridi_songs_tbody").find('tr:not(.structure_row)').remove();
  $(".searching_trigger").removeClass("on");
  $(".searching_area").removeClass("on");
  $('.search_more').removeClass('active');
}

// 리스트 가져오는 함수
function getList(){
  $('.added_list_body').find('tr:not(.structure_row)').remove();
  $.ajax({
    url: "http://ridj.herokuapp.com/api/orders",
    success: function(data) {
      // 리스트 바인딩
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

function getCurrent() {
  $.ajax({
    url: "http://ridj.herokuapp.com/api/current",
    success: function(data) {
      var song = data.current.song;
      var artist = data.current.artist;
      $('.description').append('<br><br>Now playing..<br>♬ ' + song + '<br><small>[' + artist + ']</small>');
    }
  });
}

// 검색 함수
function search(type) {
  var count = 11;
  if(type != "more") {
    $(".ridi_songs_tbody").find('tr:not(.structure_row)').remove();
    datas.searchPage = 1;
    datas.searchKeyword = $(".ridi_search_field").val();
  }
  $.ajax({
    url: "http://ridj.herokuapp.com/api/search?&page=" + datas.searchPage + "&count=" + count + "&search_keyword=" + datas.searchKeyword,
    dataType: "json"
  }).done(function (data) {
    var songs = data.melon.songs.song;
    var structureRow = $('.ridi_songs_tbody').find('.structure_row').clone().removeClass('structure_row');
    if( songs.length == 11 ) {
      var maxLength = 10;
      $('.search_more').addClass('active');
    } else {
      var maxLength = songs.length;
      $('.search_more').removeClass('active');
    }
    for (var i = 0; i < maxLength ; i++) {
      var tmpRow = structureRow.clone();
      // 데이터 바인딩
      var indexNo = Number((datas.searchPage-1)*10) + i;
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
      tmpRow.find('.ridi_add_button').attr('id', 'button-' + indexNo).val(indexNo).click(addSong);
      tmpRow.attr('id', 'list-' + indexNo).attr('song_id', songId).attr('album_id', albumId).attr('artist_id', artistId);

      $(".ridi_songs_tbody").append(tmpRow);
    }
  });
}

// 추가 검색 함수
function searchMore() {
  datas.searchPage += 1;
  search("more");
}

// 곡 추가 함수
function addSong() {
  var index = this.value;
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
    vex.dialog.alert("곡이 신청되었습니다.");
    clearSearch();
    getList();
  });
}

$(function () {
  try {
    Typekit.load();
  } catch(e) {}
  vex.defaultOptions.className = 'vex-theme-default';
  
  $(".searching_trigger").click(function() {
    $(this).hasClass("on") ? clearSearch() : openSearch();
  });
  $(".searching_area").click(function() {
    if($(event.target).is(".searching_area.on")) {
      clearSearch();
    }
  });
  $(".search_more").click(searchMore);
  $(".ridi_search_field").on("keypress", function (e) {
    if (e.which == 13) {
      search("");
    }
  });
  $(".logo").click(getList);
  
  getList();
  getCurrent();
});
