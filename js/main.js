(function() {
  var MainView = function(root) {
    var _this = this;
    var itemViews = [];
    var loading = document.getElementById('loading');
    var el = document.createElement('ul');
    var nextBtn = document.createElement('a');
    nextBtn.href = '#';
    nextBtn.appendChild(document.createTextNode('Next'));
    var hasNext = false;

    this.setHasNext = function(val) {
      if (val) {
        nextBtn.style.display = 'block';
      } else {
        nextBtn.style.display = 'none';
      }
    };

    nextBtn.onclick = function() {
      _this.onNextClick();
    };

    this.onNextClick = function() { return this; }

    this.addToItemViews = function(itemView) {
      itemViews.push(itemView);
    };

    this.clear = function() {
      itemViews = [];
      el.remove();
      el = document.createElement('ul');
      nextBtn.style.display = 'none';
      loading.style.display = 'block';
    };

    this.render = function() {
      for (var i = 0; i < itemViews.length; i++) {
        var itemView = itemViews[i];
        var dom = itemView.dom();
        if (dom) {
          el.appendChild(dom);
        }
      }

      root.appendChild(el);
      root.appendChild(nextBtn);
      loading.style.display = 'none'
    };
  };

  var ItemView = function(data) {
    this.dom = function() {
      var title = data.title;
      var description = data.description ? data.description : '';
      var url = data.url;
      var user = data.user;

      if (url) {
        if (! (title && title.trim())) {
          title = url;
        }

        var li = document.createElement('li');
        var descriptionPara = document.createElement('p');
        var link = document.createElement('a');
        var by = document.createElement('span');
        by.appendChild(document.createTextNode(" by " + user));
        link.href = url;
        link.appendChild(document.createTextNode(title));
        descriptionPara.appendChild(document.createTextNode(description));
        li.appendChild(link);
        li.appendChild(by);
        li.appendChild(descriptionPara);
        return li;
      } else {
        return null;
      }
    };
  };

  window.fbAsyncInit = function() {
    FB.init({
      appId : '665087956897812',
      xfbml : true,
      version : 'v2.0'
    });

    FB.login(function() {
      var mainView = new MainView(document.getElementById('fb'));

      var callback = function(response) {
        console.log(response.data.length);
        for (var i = 0; i < response.data.length; i++) {
          var item = response.data[i];
          if (item.type === 'link') {
            mainView.addToItemViews(new ItemView({
              title: item.name,
              description: item.description,
              url: item.link,
              user: item.from.name
            }));
          }
        }

        if (response.paging.next) {
          mainView.setHasNext(true);
          mainView.onNextClick = function() {
            count = 0;
            mainView.clear();
            FB.api(response.paging.next, callback);
          };
        } else {
          mainView.setHasNext(false);
        }

        mainView.render();
      };

      FB.api('/me/home', { limit: 500 }, callback);
    }, { scope: 'read_stream' });
  };

  (function(d, s, id) {
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
})();
