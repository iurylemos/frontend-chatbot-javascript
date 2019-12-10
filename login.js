localStorage.setItem('objJSON', '');
function entrar() {
  const user_name = document.getElementById('user_name').value.toString().trim();
  const password = document.getElementById('password').value.toString().trim();

  const http = new XMLHttpRequest();
  http.open('POST', '/user/search', true);
  http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let objJSON = JSON.parse(http.responseText);
      if ((objJSON.user_name == user_name) && (objJSON.password == password)) {
        localStorage.setItem('objJSON', JSON.stringify(objJSON));
        window.location.href = `index?user_name=${user_name}&password=${password}`;
      } else {
        window.location.href = 'login';
      }
    }
  }
  http.send(`user_name=${user_name}&password=${password}`);
}