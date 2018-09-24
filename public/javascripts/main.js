var authToken = null;

window.onload = function () {
  authToken = localStorage.getItem('token');
  if(authToken) {
    let req = new XMLHttpRequest;
    req.open('POST', '/api/users/recent', true);
    req.setRequestHeader('Authorization', `Bearer ${authToken}`);
    req.onload = function () {
      let data = JSON.parse(req.responseText);
      if(data.docs > 0) {
        let doc = document.getElementById('section-authed');
        doc.innerHTML = `Thanks for participating today.`;
        doc.style.left = "0";
        doc.style.opacity = "1";
      } else {
        let doc = document.getElementById('section-authed');
        doc.style.left = "0";
        doc.style.opacity = "1";
      }
    }
    req.send();
  } else {
    let doc = document.getElementById('section-unauthed');
    doc.style.left = "0";
    doc.style.opacity = "1";
  }
}

function buttonSwap(button, text) {
  this.prevText = button.value;
  this.newText = text;
  this.swapBack = () => {
    button.value = this.prevText;
  };
  button.value = this.newText;
}

function addItem(element) {
  let button = new buttonSwap(document.getElementById('new-submit'), 'adding');

  // new ajax thang
  let req = new XMLHttpRequest;
  req.open('POST', '/api/items', true);
  req.setRequestHeader('Authorization', `Bearer ${authToken}`);
  req.onload = function () {
    let status = req.status;
    let data = JSON.parse(req.responseText);
    if(status === 200) {
      // SUCCESS
      let newEle = document.createElement('template');
      newEle.innerHTML = data.html.trim();
      document.getElementById('thelist').insertAdjacentElement('afterbegin', newEle.content.firstChild);
      element.parentElement.parentElement.innerHTML = 'Thanks for participating today.';
      return;
    } else {
      // ERROR
      alert(`Problem. ${data.status}`);
      button.swapBack();
    }
  };

  // jic
  req.onerror = function(err) {
    alert('Problem: ' + err);
  };

  // send form data
  req.setRequestHeader('Content-Type', 'application/json');
  let body = {
    title: document.getElementById('new-title').value,
    url: document.getElementById('new-url').value
  }
  req.send(JSON.stringify(body));
}

function removeItem(element) {
  let button = new buttonSwap(document.getElementById('remove-submit'), 'removing');

  // grab the Mongo ID from the list based on the user-friendly index.
  let uIndex = document.getElementById('remove-index').value;
  let lItem = document.querySelector(`li.item[data-index='${uIndex}']`);
  if(!lItem) {
    alert(`That doesn't exist.`);
    button.swapBack();
    return;
  }
  let mId = lItem.dataset.mid;

  // new ajax thang
  let req = new XMLHttpRequest;
  req.open('DELETE', '/api/items', true);
  req.setRequestHeader('Authorization', `Bearer ${authToken}`);
  req.onload = function () {
    let status = req.status;
    let data = JSON.parse(req.responseText);
    if(status === 200) {
      // SUCCESS
      lItem.outerHTML = "";
      element.parentElement.parentElement.innerHTML = 'Thanks for participating today.';
    } else {
      // ERROR
      alert(`Problem. ${data.status}`);
      button.swapBack();
      return;
    }
  };

  // jic
  req.onerror = function(err) {
    alert('Problem: ' + err);
  };
  
  // send form data
  req.setRequestHeader('Content-Type', 'application/json');
  let body = {
    id: mId,
  }
  req.send(JSON.stringify(body));
}

// AUTH
function auth(method, dataOnly = false) {
  // user and pass
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;

  let apiPath = (method === 'signup')
    ? '/api/users/create'
    : '/api/users/login';
  
  let req = new XMLHttpRequest();
  req.open('POST', apiPath, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.onload = function() {
    let data = JSON.parse(this.response);
    if(data.token && dataOnly === false) {
      // successful signup or create
      localStorage.setItem('token', data.token);
      location.reload();
    } else if(data.token && dataOnly === true) {
      return data;
    } else {
      // fail!
      alert(data.status);
    }
  }
  req.send(JSON.stringify({
    name: username,
    password: password
  }));
}

function logout() {
  localStorage.removeItem('token');
  location.reload();
}