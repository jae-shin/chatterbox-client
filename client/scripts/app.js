const app = {};

app.init = function() {
  this._rooms = {all: 'all'};
  this._friends = [];
  this.server = 'https://api.parse.com/1/classes/messages';
  $(() => {

    // console.log($('#send .submit'));

    $('#send').on('submit', app.handleSubmit);

    $('#roomSelect').on('change', app._refreshMessages);

    $('#chats').on('click', '.username', function() {    
      app.addFriend($(this).text());
      app.fetch();
    });

    setInterval(app._refreshMessages, 5000);

    app.fetch();
  });
};

app.handleSubmit = function(event) {

  event.preventDefault();

  var $username = $('input[name="username"]');
  var $text = $('input[name="message"]');
  var $roomname = $('input[name="roomname"]');

  // TODO: if username or text is empty string, throw a red error

  var roomname = $roomname.val() || $('#roomSelect').val();
  
  var message = {
    username: $username.val(), 
    text: $text.val(),
    roomname: roomname
  };

  app.send(message);

  // Clear the text in the input fields:
  $username.val('');
  $text.val('');
  $roomname.val('');
};

app.addFriend = function(username) {
  this._friends.push(username);
};

app.fetch = function(roomname) {
  var dataObject = {};

  if (roomname) {
    dataObject.where = {'roomname': roomname};
  } else {
    dataObject.format = 'json';
  }

  $.ajax({
    url: this.server,
    type: 'GET',
    data: dataObject,
    contentType: 'application/json',
    success: function(data) {
      // console.log('chatterbox: messages retrieved');
      app._updateRooms(data);
      app._displayMessages(data);
    },
    error: function(data) {
      console.error('chatterbox: failed to retrieve messages', data);
    }
  });
};

app._displayMessages = function(data) {
  app.clearMessages();
  data.results.forEach(message => app.addMessage(message));
};

app.addMessage = function(message) {
  var $message = $('<div class="chat"></div>');
  var $username = $('<span class="username"></span>');
  $username.text(message.username);

  if (this._friends.indexOf(message.username) > -1) {
    $message.addClass('friend');
  }

  var $text = $('<span></span>');
  $text.text(': ' + message.text);

  $message.append($username);
  $message.append($text);

  if (message.roomname) {
    $message.attr('room', message.roomname);
  } else {
    $message.attr('room', 'all');
  }
  
  $('#chats').append($message); 
};

app.send = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
      //Needs to be refresh messages
      app._refreshMessages();
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app._updateRooms = function(data) {
  var results = data.results;
  results.forEach(message => {
    //Check if the message has a roomname
    //AND check if the room name doesn't already exist in rooms object
    if (message.roomname && !this._rooms[message.roomname]) {
      app.addRoom(message.roomname);
    }
  });
};

app.addRoom = function(roomname) {
  this._rooms[roomname] = roomname;
  //Update selector with room name
  $('#roomSelect').append($('<option>', { 
    value: roomname,
    text: roomname 
  }));
};

app._refreshMessages = function() {
  var $roomSelector = $('#roomSelect');
  if ($roomSelector.val() === 'all') {
    app.fetch();
  } else {
    app.fetch($roomSelector.val());
  }
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.init();





