//-- arquivo apps/pacientes/model/mdlPacientes.js

const db = require("../../../database/databaseconfig");

const GetAllPacientes = async () => {
  return (
    await db.query(
      "SELECT * " + "FROM pacientes where removido = false ORDER BY nome ASC"
    )
  ).rows;
};

const GetPacienteByID = async (pacienteIDPar) => {
  return (
    await db.query(
      "SELECT * " +
        "FROM pacientes WHERE pacienteid = $1 and removido = false ORDER BY nome ASC",
      [pacienteIDPar]
    )
  ).rows;
};

const InsertPaciente = async (registroPar) => {
  //@ Atenção: aqui utilizamos a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO pacientes " + "values(default, $1, $2, $3, $4, false)",
        [
          registroPar.cpf,
          registroPar.nome,
          registroPar.datanascimento,
          registroPar.telefone,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPacientes|InsertPaciente] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdatePaciente = async (pacienteIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE pacientes SET " +
          "cpf = $2, " +
          "nome = $3, " +
          "datanascimento = $4, " +
          "telefone = $5 " +
          "WHERE pacienteid = $1 and removido = false",
        [
          pacienteIDPar,
          registroPar.cpf,
          registroPar.nome,
          registroPar.datanascimento,
          registroPar.telefone,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPacientes|UpdatePaciente] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeletePaciente = async (pacienteIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    //@ Não deixa remover um paciente que ainda tem consultas.
    const totalConsultas = (
      await db.query(
        "SELECT count(*) FROM consultas WHERE pacienteid = $1 and removido = false",
        [pacienteIDPar]
      )
    ).rows[0].count;

    if (totalConsultas > 0) {
      return { msg: "Este paciente possui consultas e não pode ser removido.", linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE pacientes SET " + "removido = true " + "WHERE pacienteid = $1 and removido = false",
        [pacienteIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPacientes|DeletePaciente] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllPacientes,
  GetPacienteByID,
  InsertPaciente,
  UpdatePaciente,
  DeletePaciente,
};
