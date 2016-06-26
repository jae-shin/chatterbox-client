document.addEventListener('DOMContentLoaded', function() {

  const defaultRoomname = 'all';
  const startTimeForCreatedAt = '2001-01-00T00:00:00.000Z';

  window.app = {
    server: 'https://api.parse.com/1/classes/messages',
    username: window.location.search.slice(10).trim(),
    roomnames: {defaultRoomname: true},
    friends: {},
    mostRecentCreatedAt: startTimeForCreatedAt,

    init: function() {
      $('#chats').on('click', '.username', app.addFriend);
      $('#send').on('submit', app.handleSubmit);
      $('#roomSelect').on('change', app.handleRoomChange);

      app.fetch();
      setInterval(app.fetch, 5000);
    },

    send: function(message) {
      $.ajax({
        url: app.server,
        type: 'POST',
        data: JSON.stringify(message),
        contentType: 'application/json',
        success: function (data) {
          app.fetch();
          console.log('chatterbox: Message sent');
        },
        error: function (data) {
          console.error('chatterbox: Failed to send message', data);
        }
      });
    },

    // option is true when invoking fetch right after a room change
    fetch: function(option) { 
      if (option) {
        app.mostRecentCreatedAt = startTimeForCreatedAt;
      }

      let queryObject = {
        order: '-createdAt',
        where: {createdAt: {$gt: app.mostRecentCreatedAt}}
      };

      roomname = $('#roomSelect').val();

      if (roomname !== defaultRoomname) {
        queryObject.where.roomname = roomname;
      }

      $.ajax({
        url: app.server,
        type: 'GET',
        data: queryObject,
        contentType: 'application/json',
        success: function (data) {
          let messages = data.results;
          if (messages.length === 0) {
            return;
          }
          
          app.mostRecentCreatedAt = messages[0].createdAt;
          
          for (var i = messages.length - 1; i >= 0; i--) {
            app.addMessage(messages[i]);
          }

          messages.forEach(message => {
            if (!(message.roomname in app.roomnames)) {
              app.roomnames[message.roomname] = true;
              app.addRoom(message.roomname);
            }
          });

          console.log('chatterbox: Message(s) retreived');
        },
        error: function (data) {
          console.error('chatterbox: Failed to retreive message(s)', data);
        }
      });
    },

    clearMessages: function() {
      $('#chats').empty();
    },

    addMessage: function(message) {
      var isFriend = message.username in app.friends;
      let $username = $('<span class="username"/> ').text(message.username);
      let $text = $('<span class="message"/>').text(`: ${message.text}`);
      if (isFriend) {
        $username.addClass('friend');
        $text.addClass('bold');
      }
      let $message = $('<div class="chat"/>').attr('roomname', message.roomname).append($username, $text);
      $('#chats').prepend($message);
    },

    addRoom: function(roomname) {
      let $roomname = $('<option/>').attr('value', roomname).text(roomname);
      $('#roomSelect').append($roomname);
    },

    addFriend: function(event) {
      var username = $(event.target).text();
      if (username in app.friends) {
        delete app.friends[username];
      } else {
        app.friends[username] = true;
      }
      $('#chats .username').filter(function(index, usernameEl) {
        return $(usernameEl).text() === username;
      }).toggleClass('friend').next().toggleClass('bold');
    },

    handleSubmit: function(event) {
      let message = {
        username: app.username,
        text: $('#message').val(),
        roomname: $('#roomSelect option:selected').val()
      };
      $('#message').val('');
      app.send(message);
      event.preventDefault();
    },

    handleRoomChange: function() {
      app.clearMessages();
      app.fetch(true);
    }
  };

  app.init();
});


