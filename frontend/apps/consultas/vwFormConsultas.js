// Arquivo: apps/consultas/vwFormConsultas.js

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmConsultas');

  if (!form) {
    return;
  }

  // oper vem da url: Cr (criar), Re (visualizar), Up (atualizar) e De (remover)
  var oper = new URLSearchParams(window.location.search).get('oper') || 'Cr';
  var btnInserir = document.getElementById('btnInserirConsulta');
  var btnAtualizar = document.getElementById('btnAtualizarConsulta');
  var btnRemover = document.getElementById('btnRemoverConsulta');

  inicializarSelectPacientes();

  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', function() {
      vwInsertConsulta();
    });
    carregarPacientesToConsultas();
  }

  if (oper === 'Re') {
    bloquearCamposConsulta();
    vwGetConsultaByID();
  }

  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = true;
    btnAtualizar.addEventListener('click', function() {
      vwUpdateConsulta();
    });
    btnAtualizar.disabled = !(await vwGetConsultaByID());
  }

  if (oper === 'De') {
    bloquearCamposConsulta();
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = true;
    btnRemover.addEventListener('click', function() {
      vwDeleteConsulta();
    });
    btnRemover.disabled = !(await vwGetConsultaByID());
  }
});

// Aqui é inicializado o componente Select2.js em branco
function inicializarSelectPacientes() {
  $('#pacienteid').select2({
    theme: 'bootstrap-5',
    placeholder: 'Selecione um paciente',
    width: '100%'
  });
}

function bloquearCamposConsulta() {
  document.getElementById('medico').readOnly = true;
  document.getElementById('motivo').readOnly = true;
  document.getElementById('dataconsulta').readOnly = true;
  document.getElementById('valor').readOnly = true;
  document.getElementById('pacienteid').disabled = true;
}

function montarConsultaDoFormulario() {
  return {
    dataconsulta: document.getElementById('dataconsulta').value,
    medico: document.getElementById('medico').value,
    motivo: document.getElementById('motivo').value,
    valor: Number(document.getElementById('valor').value),
    pacienteid: Number(document.getElementById('pacienteid').value)
  };
}

function obterConsultaIdDaUrl() {
  var consultaId = new URLSearchParams(window.location.search).get('consultaId');

  if (!consultaId || !/^\d+$/.test(consultaId) || Number(consultaId) <= 0) {
    throw new Error('ID da consulta inválido.');
  }

  return consultaId;
}

// Faz a requisição ao backend e trata as respostas de erro padrão do sistema.
async function enviarRequisicaoConsulta(caminho, opcoes, mensagemErro) {
  var servidorDw3 = document.getElementById('frmConsultas').dataset.servidorDw3;

  if (!servidorDw3) {
    throw new Error('Endereço do servidor backend não configurado.');
  }

  var response = await fetch(servidorDw3 + caminho, opcoes);

  if (!response.ok) {
    throw new Error(mensagemErro);
  }

  var data = await response.json();

  if (data.auth === false) {
    dw3SessaoExpirada(); // JWT expirado: volta para a tela de login.
    // Promise que nunca termina: interrompe a operação sem mostrar outro alerta de erro.
    return new Promise(function() {});
  }

  if (data.status !== 'ok') {
    throw new Error(data.status || mensagemErro);
  }

  return data;
}

// Aqui é preenchido o componente Select2 com os pacientes cadastrados
async function carregarPacientesToConsultas() {
  try {
    var data = await enviarRequisicaoConsulta('/getPacientesToConsultas', {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar os pacientes.');

    var pacienteSelect = document.getElementById('pacienteid');
    pacienteSelect.innerHTML = '<option value="">Selecione um paciente</option>';

    data.registro.forEach(function(paciente) {
      var option = document.createElement('option');
      option.value = paciente.pacienteid;
      option.textContent = paciente.nome + ' (' + paciente.cpf + ')';
      pacienteSelect.appendChild(option);
    });

    $('#pacienteid').trigger('change');
  } catch (error) {
    alert(error.message || 'Erro ao carregar pacientes.');
  }
}

// Retorna true quando a consulta foi carregada no formulário.
async function vwGetConsultaByID() {
  try {
    var consultaId = obterConsultaIdDaUrl();
    var data = await enviarRequisicaoConsulta('/getConsultaByID/' + encodeURIComponent(consultaId), {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar a consulta.');

    var consulta = Array.isArray(data.registro) ? data.registro[0] : null;

    if (!consulta) {
      throw new Error('Consulta não encontrada.');
    }

    document.getElementById('consultaid').value = consulta.consultaid;
    document.getElementById('medico').value = consulta.medico ?? '';
    document.getElementById('motivo').value = consulta.motivo ?? '';
    document.getElementById('dataconsulta').value = consulta.dataconsulta ?? '';
    document.getElementById('valor').value = consulta.valor ?? '';

    await carregarPacientesToConsultas(); // Carrega o componente Select2.
    $('#pacienteid').val(String(consulta.pacienteid)).trigger('change');
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar consulta.');
    return false;
  }
}

async function vwInsertConsulta() {
  var form = document.getElementById('frmConsultas');
  var btnInserir = document.getElementById('btnInserirConsulta');

  if (!form.reportValidity()) {
    return;
  }

  try {
    btnInserir.disabled = true;

    await enviarRequisicaoConsulta('/insertConsulta', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarConsultaDoFormulario())
    }, 'Não foi possível inserir a consulta.');

    window.location.href = '/consultas';
  } catch (error) {
    alert(error.message || 'Erro ao inserir consulta.');
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdateConsulta() {
  var form = document.getElementById('frmConsultas');
  var btnAtualizar = document.getElementById('btnAtualizarConsulta');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var consultaId = obterConsultaIdDaUrl();
    btnAtualizar.disabled = true;

    var data = await enviarRequisicaoConsulta('/updateConsulta/' + encodeURIComponent(consultaId), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarConsultaDoFormulario())
    }, 'Não foi possível atualizar a consulta.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma consulta foi atualizada.');
    }

    alert('Consulta atualizada com sucesso.');
    window.location.href = '/consultas';
  } catch (error) {
    alert(error.message || 'Erro ao atualizar consulta.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeleteConsulta() {
  var btnRemover = document.getElementById('btnRemoverConsulta');

  if (btnRemover.disabled || !window.confirm('Confirma a remoção desta consulta?')) {
    return;
  }

  try {
    var consultaId = obterConsultaIdDaUrl();
    btnRemover.disabled = true;

    var data = await enviarRequisicaoConsulta('/deleteConsulta/' + encodeURIComponent(consultaId), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível remover a consulta.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma consulta foi removida.');
    }

    window.location.href = '/consultas';
  } catch (error) {
    alert(error.message || 'Erro ao remover consulta.');
  } finally {
    btnRemover.disabled = false;
  }
}
