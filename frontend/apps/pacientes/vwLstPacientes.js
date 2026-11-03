// arquivo: ./apps/pacientes/vwLstPacientes.js

document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById('pacientesListagem');
  var alertBox = document.getElementById('pacientesAlert');

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3;

  configurarOperacoesPacientes();
  vwGetAllPacientes(servidorDw3, alertBox);
});

async function vwGetAllPacientes(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidorDw3 + '/getAllPacientes', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar a lista de pacientes.');
    }

    var data = await response.json();

    if (data.auth === false) {
      dw3SessaoExpirada(); // JWT expirado: volta para a tela de login.
      return;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    inicializarTabelaPacientes(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || 'Erro ao carregar pacientes.');
    inicializarTabelaPacientes([]);
  }
}

function inicializarTabelaPacientes(pacientes) {
  new DataTable('#tblPacientes', {
    data: pacientes,
    columns: [
      { data: 'pacienteid', defaultContent: '' },
      { data: 'cpf', defaultContent: '' },
      { data: 'nome', defaultContent: '' },
      {
        data: 'datanascimento',
        defaultContent: '',
        render: function(data, type) {
          if (!data || type !== 'display') {
            return data || '';
          }

          return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
        }
      },
      { data: 'telefone', defaultContent: '' },
      {
        data: null,
        orderable: false,
        searchable: false,
        render: function(data, type, row) {
          if (type !== 'display') {
            return '';
          }

          var pacienteId = escaparHtml(row.pacienteid || '');

          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações do paciente">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-pacienteid="' + pacienteId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-pacienteid="' + pacienteId + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-pacienteid="' + pacienteId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
            '</div>'
          ].join('');
        }
      }
    ],
    language: {
      emptyTable: 'Nenhum paciente cadastrado.',
      info: 'Mostrando _START_ até _END_ de _TOTAL_ registros',
      infoEmpty: 'Mostrando 0 até 0 de 0 registros',
      infoFiltered: '(filtrado de _MAX_ registros no total)',
      lengthMenu: 'Mostrar _MENU_ registros',
      loadingRecords: 'Carregando...',
      processing: 'Processando...',
      search: 'Pesquisar:',
      zeroRecords: 'Nenhum registro encontrado',
      paginate: {
        first: 'Primeiro',
        last: 'Último',
        next: 'Próximo',
        previous: 'Anterior'
      }
    }
  });
}

function configurarOperacoesPacientes() {
  var tabela = document.getElementById('tblPacientes');

  if (!tabela) {
    return;
  }

  tabela.addEventListener('click', function(event) {
    var botao = event.target.closest('button[data-action][data-pacienteid]');

    if (!botao) {
      return;
    }

    var operacoes = { visualizar: 'Re', atualizar: 'Up', remover: 'De' };
    var oper = operacoes[botao.dataset.action];

    if (oper) {
      window.location.href = '/pacientes/form?oper=' + oper + '&pacienteId=' + encodeURIComponent(botao.dataset.pacienteid);
    }
  });
}

function escaparHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function exibirErro(alertBox, mensagem) {
  if (!alertBox) {
    return;
  }

  alertBox.textContent = mensagem;
  alertBox.classList.remove('alert-info');
  alertBox.classList.add('alert-danger');
  alertBox.classList.remove('d-none');
}
