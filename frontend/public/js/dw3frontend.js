// arquivo: public/js/dw3frontend.js

function dw3IsLogged() {
  const isLogged = document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('IsLogged='));

  if (!isLogged) {
    window.location.href = '/login';
    return false;
  }

  return true;
}

function dw3ClearIsLoggedCookie() {
  // Limpa o Cookie Islogged
  var isLogged = document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('IsLogged='));

  if (isLogged) {
    document.cookie = 'IsLogged=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

function dw3MontarHeadersAutenticacao(headers) {
  var token = localStorage.getItem('token');
  var finalHeaders = headers || {};

  if (token) {
    finalHeaders.Authorization = 'Bearer ' + token;
  }

  return finalHeaders;
}

function dw3OcultarBotao(id) {
  var botao = document.getElementById(id);

  if (botao) {
    botao.classList.add('d-none');
  }
}

// Chamada quando o backend responde auth:false (JWT inválido ou expirado).
// Limpa os dados da sessão e manda o usuário de volta para a tela de login.
function dw3SessaoExpirada() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  dw3ClearIsLoggedCookie();
  alert('Sua sessão expirou. Faça login novamente.');
  window.location.href = '/login';
}
