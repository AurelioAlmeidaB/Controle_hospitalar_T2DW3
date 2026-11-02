// Arquivo: apps/pacientes/vwFormPacientes.js

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmPacientes');

  if (!form) {
    return;
  }

  // oper vem da url: Cr (criar), Re (visualizar), Up (atualizar) e De (remover)
  var oper = new URLSearchParams(window.location.search).get('oper') || 'Cr';
  var btnInserir = document.getElementById('btnInserirPaciente');
  var btnAtualizar = document.getElementById('btnAtualizarPaciente');
  var btnRemover = document.getElementById('btnRemoverPaciente');

  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', function() {
      vwInsertPaciente();
    });
  }

  if (oper === 'Re') {
    bloquearCamposPaciente();
    vwGetPacienteByID();
  }

  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = true;
    btnAtualizar.addEventListener('click', function() {
      vwUpdatePaciente();
    });
    btnAtualizar.disabled = !(await vwGetPacienteByID());
  }

  if (oper === 'De') {
    bloquearCamposPaciente();
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = true;
    btnRemover.addEventListener('click', function() {
      vwDeletePaciente();
    });
    btnRemover.disabled = !(await vwGetPacienteByID());
  }
});

function bloquearCamposPaciente() {
  document.getElementById('cpf').readOnly = true;
  document.getElementById('nome').readOnly = true;
  document.getElementById('datanascimento').readOnly = true;
  document.getElementById('telefone').readOnly = true;
}

function montarPacienteDoFormulario() {
  return {
    cpf: document.getElementById('cpf').value,
    nome: document.getElementById('nome').value,
    datanascimento: document.getElementById('datanascimento').value,
    telefone: document.getElementById('telefone').value
  };
}

function obterPacienteIdDaUrl() {
  var pacienteId = new URLSearchParams(window.location.search).get('pacienteId');

  if (!pacienteId || !/^\d+$/.test(pacienteId) || Number(pacienteId) <= 0) {
    throw new Error('ID do paciente inválido.');
  }

  return pacienteId;
}

// Faz a requisição ao backend e trata as respostas de erro padrão do sistema.
async function enviarRequisicaoPaciente(caminho, opcoes, mensagemErro) {
  var servidorDw3 = document.getElementById('frmPacientes').dataset.servidorDw3;

  if (!servidorDw3) {
    throw new Error('Endereço do servidor backend não configurado.');
  }

  var response = await fetch(servidorDw3 + caminho, opcoes);

  if (!response.ok) {
    throw new Error(mensagemErro);
  }

  var data = await response.json();

  if (data.auth === false) {
    throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
  }

  if (data.status !== 'ok') {
    throw new Error(data.status || mensagemErro);
  }

  return data;
}

// Retorna true quando o paciente foi carregado no formulário.
async function vwGetPacienteByID() {
  try {
    var pacienteId = obterPacienteIdDaUrl();
    var data = await enviarRequisicaoPaciente('/getPacienteByID/' + encodeURIComponent(pacienteId), {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar o paciente.');

    var paciente = Array.isArray(data.registro) ? data.registro[0] : null;

    if (!paciente) {
      throw new Error('Paciente não encontrado.');
    }

    document.getElementById('pacienteid').value = paciente.pacienteid;
    document.getElementById('cpf').value = paciente.cpf ?? '';
    document.getElementById('nome').value = paciente.nome ?? '';
    document.getElementById('datanascimento').value = paciente.datanascimento ?? '';
    document.getElementById('telefone').value = paciente.telefone ?? '';
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar paciente.');
    return false;
  }
}

async function vwInsertPaciente() {
  var form = document.getElementById('frmPacientes');
  var btnInserir = document.getElementById('btnInserirPaciente');

  if (!form.reportValidity()) {
    return;
  }

  try {
    btnInserir.disabled = true;

    await enviarRequisicaoPaciente('/insertPaciente', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarPacienteDoFormulario())
    }, 'Não foi possível inserir o paciente.');

    window.location.href = '/pacientes';
  } catch (error) {
    alert(error.message || 'Erro ao inserir paciente.');
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdatePaciente() {
  var form = document.getElementById('frmPacientes');
  var btnAtualizar = document.getElementById('btnAtualizarPaciente');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var pacienteId = obterPacienteIdDaUrl();
    btnAtualizar.disabled = true;

    var data = await enviarRequisicaoPaciente('/updatePaciente/' + encodeURIComponent(pacienteId), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarPacienteDoFormulario())
    }, 'Não foi possível atualizar o paciente.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum paciente foi atualizado.');
    }

    alert('Paciente atualizado com sucesso.');
    window.location.href = '/pacientes';
  } catch (error) {
    alert(error.message || 'Erro ao atualizar paciente.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeletePaciente() {
  var btnRemover = document.getElementById('btnRemoverPaciente');

  if (btnRemover.disabled || !window.confirm('Confirma a remoção deste paciente?')) {
    return;
  }

  try {
    var pacienteId = obterPacienteIdDaUrl();
    btnRemover.disabled = true;

    var data = await enviarRequisicaoPaciente('/deletePaciente/' + encodeURIComponent(pacienteId), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível remover o paciente.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum paciente foi removido.');
    }

    window.location.href = '/pacientes';
  } catch (error) {
    alert(error.message || 'Erro ao remover paciente.');
  } finally {
    btnRemover.disabled = false;
  }
}
