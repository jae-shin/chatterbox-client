// YOUR CODE HERE:

//Global object to house all rooms
var rooms = {};

var displayMessages = function(data) {
  $('.chat').remove();
  var results = data.results;
  results.forEach(function(message) {
    var $message = $('<div class="chat"></div>');
    $message.text(message.username + ': ' + message.text);
    $('#chats').append($message);
  });
};

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

  $refreshButton.on('click', function() {
    getMessages();
  });

  var $postButton = $('#post');
  $postButton.on('click', function() {
    var username = $('input[name="username"]').val();
    var text = $('textarea[name="message"]').val();
    var roomname = $('input[name="roomname"]').val();
    var message = {
      username: username, 
      text: text,
      roomname: roomname
    };
    postMessage(message);
  });

  getMessages();
});






