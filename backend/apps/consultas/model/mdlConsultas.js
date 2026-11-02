//-- arquivo apps/consultas/model/mdlConsultas.js

const db = require("../../../database/databaseconfig");

const GetAllConsultas = async () => {
  return (
    await db.query(
      "SELECT c.*, p.nome as pacientenome, p.cpf " +
        "FROM consultas c INNER JOIN pacientes p ON p.pacienteid = c.pacienteid " +
        "WHERE c.removido = false ORDER BY c.dataconsulta DESC, c.consultaid DESC"
    )
  ).rows;
};

const GetConsultaByID = async (consultaIDPar) => {
  return (
    await db.query(
      "SELECT c.*, p.nome as pacientenome, p.cpf " +
        "FROM consultas c INNER JOIN pacientes p ON p.pacienteid = c.pacienteid " +
        "WHERE c.consultaid = $1 and c.removido = false",
      [consultaIDPar]
    )
  ).rows;
};

//@ Pacientes usados no componente Select do formulário de consultas.
const GetPacientesToConsultas = async () => {
  return (
    await db.query(
      "SELECT pacienteid, nome, cpf FROM pacientes " +
        "WHERE removido = false ORDER BY nome ASC"
    )
  ).rows;
};

const InsertConsulta = async (registroPar) => {
  //@ Atenção: aqui utilizamos a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO consultas " + "values(default, $1, $2, $3, $4, $5, false)",
        [
          registroPar.dataconsulta,
          registroPar.medico,
          registroPar.motivo,
          registroPar.valor,
          registroPar.pacienteid,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlConsultas|InsertConsulta] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdateConsulta = async (consultaIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE consultas SET " +
          "dataconsulta = $2, " +
          "medico = $3, " +
          "motivo = $4, " +
          "valor = $5, " +
          "pacienteid = $6 " +
          "WHERE consultaid = $1 and removido = false",
        [
          consultaIDPar,
          registroPar.dataconsulta,
          registroPar.medico,
          registroPar.motivo,
          registroPar.valor,
          registroPar.pacienteid,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlConsultas|UpdateConsulta] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeleteConsulta = async (consultaIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE consultas SET " + "removido = true " + "WHERE consultaid = $1 and removido = false",
        [consultaIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlConsultas|DeleteConsulta] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllConsultas,
  GetConsultaByID,
  GetPacientesToConsultas,
  InsertConsulta,
  UpdateConsulta,
  DeleteConsulta,
};
