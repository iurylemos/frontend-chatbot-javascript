const strJSON = localStorage.getItem('objJSON').toString().trim();
if (strJSON.length <= 0) {
  window.location.href = 'login.html';
} else {
  try {
    const objJSON = JSON.parse(strJSON);
    valida(objJSON);
  } catch (e) {
    console.error('ERRO na conversão do objeto:', e);
    window.location.href = 'login.html';
  }
}

function valida(objJSON = {}) {
  if ((objJSON.user_name) && (objJSON.password)) {
    document.getElementById('code_user').value = objJSON.code_user;
    entrar(objJSON.user_name, objJSON.password);
  } else {
    window.location.href = 'login.html';
  }
}

function entrar(user_name = '', password = '') {
  const http = new XMLHttpRequest();
  http.open('POST', '/user/search', true);
  http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let objJSON = JSON.parse(http.responseText);
      if ((objJSON.user_name != user_name) || (objJSON.password != password)) {
        window.location.href = 'login.html';
      } else {
        listar();
      }
    }
  }
  http.send(`user_name=${user_name}&password=${password}`);
}

let optionsSelect = [0];
function listar() {
  const code_user = Number(document.getElementById('code_user').value);
  const linhas = document.getElementById('linhas');
  const code_relation = document.getElementById('code_relation');

  const http = new XMLHttpRequest();
  http.open('POST', '/chatbot/find', true);
  http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let objJSON = JSON.parse(http.responseText);
      if (objJSON.length > 0) {
        let strRelation = '<option value="0">Relação com Resposta Anterior</option>';
        let strLinhas = '';
        for (let i = 0; i < objJSON.length; i++) {
          optionsSelect.push(Number(objJSON[i].code_current));
          strRelation +=
            `<option value="${objJSON[i].code_current}">${objJSON[i].output}</option>`;

          strLinhas +=
            `
	   								<tr>
	   									<td width="400px">${objJSON[i].input}</td>
	   									<td align="center">
	   										<button class="btn btn-info"
	   										onclick="selecionar(${objJSON[i].code_current})">
	   											selecionar
	   										</button>
	   									</td>
	   								</tr>
	   							`;
        }
        code_relation.innerHTML = strRelation;
        linhas.innerHTML = strLinhas;
      }
    }
    listarDocumentos();
  }
  http.send(`code_user=${code_user}&activate=true`);
}

function selecionar(_code_current = -1) {
  const http = new XMLHttpRequest();
  http.open('POST', '/chatbot/find', true);
  http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let objJSON = JSON.parse(http.responseText);
      if (objJSON.length > 0) {
        const code_current = document.getElementById('code_current');
        const code_relation = document.getElementById('code_relation');
        const input = document.getElementById('input');
        const output = document.getElementById('output');

        code_current.value = objJSON[0].code_current;

        code_relation.selectedIndex =
          optionsSelect.indexOf(Number(objJSON[0].code_relation));
        code_relation.value = objJSON[0].code_relation;

        input.value = objJSON[0].input;
        output.value = objJSON[0].output;
      }
    }
  }
  http.send(`code_current=${_code_current}&activate=true`);
}

function novo() {
  document.getElementById('code_current').value = 0;
  document.getElementById('code_relation').selectedIndex = 0;
  document.getElementById('code_relation').value = 0;
  document.getElementById('input').value = '';
  document.getElementById('output').value = '';
  document.getElementById('input').focus();
}

function salvar() {
  const code_user = Number(document.getElementById('code_user').value);
  const code_current = Number(document.getElementById('code_current').value);
  const code_relation = Number(document.getElementById('code_relation').value);
  const input = document.getElementById('input').value.toString().trim();
  const output = document.getElementById('output').value.toString().trim();

  let params = '';
  if (code_user > 0) params += `code_user=${code_user}&`;
  if (code_current > 0) params += `code_current=${code_current}&`;
  if (code_relation > 0) params += `code_relation=${code_relation}&`;
  if (input.length > 0) params += `input=${input}&`;
  if (output.length > 0) params += `output=${output}&`;
  params += '#';
  params = params.replace('&#', '');

  const http = new XMLHttpRequest();
  if (code_current <= 0)
    http.open('POST', '/chatbot/insert', true);
  else
    http.open('POST', '/chatbot/update', true);

  http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let objJSON = JSON.parse(http.responseText);
      if (Number(objJSON.result.n) > 0) {
        listar();
      }
    }
  }
  http.send(params);
}

function deletar() {
  const code_user = Number(document.getElementById('code_user').value);
  const code_current = Number(document.getElementById('code_current').value);
  const code_relation = Number(document.getElementById('code_relation').value);
  const input = document.getElementById('input').value.toString().trim();
  const output = document.getElementById('output').value.toString().trim();

  let params = '';
  if (code_user > 0) params += `code_user=${code_user}&`;
  if (code_current > 0) params += `code_current=${code_current}&`;
  if (code_relation > 0) params += `code_relation=${code_relation}&`;
  if (input.length > 0) params += `input=${input}&`;
  if (output.length > 0) params += `output=${output}&`;
  params += '#';
  params = params.replace('&#', '');

  const http = new XMLHttpRequest();
  http.open('POST', '/chatbot/delete', true);

  http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let objJSON = JSON.parse(http.responseText);
      if (Number(objJSON.result.n) > 0) {
        listar();
        novo();
      }
    }
  }
  http.send(params);
}

function listarDocumentos() {
  const code_user = Number(document.getElementById('code_user').value);
  const documentos = document.getElementById('documentos');

  const http = new XMLHttpRequest();
  http.open('POST', '/documents/find', true);
  http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let objJSON = JSON.parse(http.responseText);
      if (objJSON.length > 0) {
        let strLinhas = '';
        for (let i = 0; i < objJSON.length; i++) {
          strLinhas +=
            `
									<tr>
										<td nowrap="true">${objJSON[i].nome}</td>
										<td>${objJSON[i].idade}</td>
										<td>${objJSON[i].email}</td>
										<td>${objJSON[i].celular}</td>
										<td>${objJSON[i].telefone}</td>
										<td>${objJSON[i].cep}</td>
										<td nowrap="true">${objJSON[i].endereco}</td>
										<td>${objJSON[i].bairro}</td>
										<td>${objJSON[i].numero}</td>
										<td>${objJSON[i].cpf}</td>
										<td>${objJSON[i].cnpj}</td>
									</tr>
	   							`;
        }
        documentos.innerHTML = strLinhas;
      }
    }
  }
  http.send(`code_user=${code_user}&activate=true`)
}