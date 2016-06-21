//Global object to house all roomnames
var rooms = {all: 'all'};

var getMessages = function() {
  $.ajax({
    //some comment
    url: 'https://api.parse.com/1/classes/messages',
    type: 'GET',
    data: {
      format: 'json'
    },
    contentType: 'application/json',
    success: function(data) {
      console.log('chatterbox: messages retrieved');
      updateRooms(data);
      displayMessages(data);
    },
    error: function(data) {
      console.error('chatterbox: failed to retrieve messages', data);
    }
  });
};

var displayMessages = function(data) {
  $('.chat').remove();
  var results = data.results;
  results.forEach(function(message) {    

    var $message = $('<div class="chat"></div>');
    $message.text(message.username + ': ' + message.text);

    if (message.roomname) {
      $message.attr('room', message.roomname);
    } else {
      $message.attr('room', 'all');
    }
    
    $('#chats').append($message);

    //Hide messages if the room selected does not match
    if ($('#room-selector').val() !== 'all' &&
        $('#room-selector').val() !== message.roomname) {
      $message.hide();
    }
  });
};

var postMessage = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
      getMessages();
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};


var updateRooms = function(data) {

  var results = data.results;

  results.forEach(function(message) {

    //Check if the message has a roomname
    //AND check if the room name doesn't already exist in rooms object
    if (message.roomname && !rooms[message.roomname]) {
      //Add room to global rooms object
      rooms[message.roomname] = message.roomname;
      //Update selector with room name
      $('#room-selector').append($('<option>', { 
        value: message.roomname,
        text: message.roomname 
      }));
    }

  });
};


$(document).ready(function() {
  var $refreshButton = $('<button id=refresh>Refresh!</button>');
  $('#main').append($refreshButton);

  // TODO: make refreshing automatic
  $refreshButton.on('click', function() {
    getMessages();
  });

  var $postButton = $('#post');
  $postButton.on('click', function() {
    var $username = $('input[name="username"]');
    var $text = $('textarea[name="message"]');
    var $roomname = $('input[name="roomname"]');
    var message = {
      username: $username.val(), 
      text: $text.val(),
      roomname: $roomname.val()
    };
    postMessage(message);

    // Clear the text in the input fields:
    $username.val('');
    $text.val('');
    $roomname.val('');
  });

  var $roomSelector = $('#room-selector');
  $roomSelector.on('change', function() {
    console.log(this.value); // or $(this).val()
    getMessages();
  });

  getMessages();
});






