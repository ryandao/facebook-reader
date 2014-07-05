(function() {
  var MainView = function(root) {
    var _this = this;
    var itemViews = [];
    var loading = document.getElementById('loading');
    var errMessage = document.getElementById('error');
    var el = document.createElement('ul');
    var error = false;

    // Pagination stuff
    var nextBtn = document.getElementById('nextBtn');
    var prevBtn = document.getElementById('prevBtn');
    this.pageNum = 1; this.maxPageNum = 1;

    this.setError = function(val) {
      error = val;
      if (val) {
        errMessage.style.display = 'block';
      } else {
        errMessage.style.display = 'none';
      }
    }

    nextBtn.onclick = function() {
      _this.onNextClick();
    };

    prevBtn.onclick = function() {
      _this.onPrevClick();
    }

    this.onNextClick = function() { return this; }
    this.onPrevClick = function() { return this; }

    this.addItems = function(items) {
      if (items.length == 0) {
        el.appendChild(document.createTextNode('No result found. Reload to fetch again.'))
      } else {
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (item.type === 'link') {
            itemViews.push(new ItemView({
              title: item.name,
              description: item.description,
              url: item.link,
              user: item.from.name
            }));
          }
        }
      }
    };

    this.renderItems = function(items) {
      this.clear();
      this.addItems(items);
      this.render();
    };

    this.clear = function() {
      itemViews = [];
      el.remove();
      el = document.createElement('ul');
      nextBtn.style.display = 'none';
      prevBtn.style.display = 'none';
      loading.style.display = 'block';
    };

    this.render = function() {
      loading.style.display = 'none';

      if (error) {
        errMessage.style.display = 'block';
      } else {
        errMessage.style.display = 'none';

        for (var i = 0; i < itemViews.length; i++) {
          var itemView = itemViews[i];
          var dom = itemView.dom();
          if (dom) {
            el.appendChild(dom);
          }
        }

        root.insertBefore(el, root.firstChild);
        if (this.pageNum !== 1) { prevBtn.style.display = 'block'; }
        if (this.pageNum < this.maxPageNum) { nextBtn.style.display = 'block'; }
      }
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
    // A cache for all the results found so we don't need to reload everything
    var resultCache = [];

    FB.init({
      appId : '665087956897812',
      xfbml : true,
      version : 'v2.0'
    });

    FB.login(function() {
      var mainView = new MainView(document.getElementById('fb'));

      var callback = function(response) {
        if (response.data) {
          resultCache[mainView.pageNum - 1] = response.data;
          mainView.addItems(response.data);

          if (response.paging && response.paging.next) {
            mainView.maxPageNum ++;

            mainView.onNextClick = function() {
              mainView.pageNum ++;
              mainView.clear();

              if (resultCache[mainView.pageNum - 1]) {
                mainView.renderItems(resultCache[mainView.pageNum - 1]);
              } else {
                FB.api(response.paging.next, callback);
              }
            };

            mainView.onPrevClick = function() {
              mainView.pageNum --;
              mainView.clear();

              if (resultCache[mainView.pageNum - 1]) {
                mainView.renderItems(resultCache[mainView.pageNum - 1]);
              } else {
                FB.api(response.paging.previous, callback);
              }
            }
          }
        } else {
          mainView.setError(true);
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
