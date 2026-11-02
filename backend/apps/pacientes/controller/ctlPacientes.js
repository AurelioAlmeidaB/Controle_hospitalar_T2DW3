//-- arquivo apps/pacientes/controller/ctlPacientes.js

const mdlPacientes = require("../model/mdlPacientes");

// Elimina parte final de uma variável data com essa: 1980-05-14T03:00:00.000Z
const formataData = (registro) => {
  for (let i = 0; i < registro.length; i++) {
    const row = registro[i];
    if (row.datanascimento) {
      row.datanascimento = row.datanascimento.toISOString().split('T')[0];
    }
  }
  return registro;
};

const GetAllPacientes = (req, res) =>
  (async () => {
    let registro = await mdlPacientes.GetAllPacientes();
    res.json({ status: "ok", "registro": formataData(registro) });
  })();

const GetPacienteByID = (req, res) =>
  (async () => {
    const pacienteID = parseInt(req.params.pacienteid);
    let registro = await mdlPacientes.GetPacienteByID(pacienteID);
    res.json({ status: "ok", "registro": formataData(registro) });
  })();

const InsertPaciente = (request, res) =>
  (async () => {
    const pacienteREG = request.body;
    let { msg, linhasAfetadas } = await mdlPacientes.InsertPaciente(pacienteREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

const UpdatePaciente = (request, res) =>
  (async () => {
    const pacienteID = parseInt(request.params.pacienteid);
    const pacienteREG = request.body;
    let { msg, linhasAfetadas } = await mdlPacientes.UpdatePaciente(pacienteID, pacienteREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

const DeletePaciente = (request, res) =>
  (async () => {
    const pacienteID = parseInt(request.params.pacienteid);
    let { msg, linhasAfetadas } = await mdlPacientes.DeletePaciente(pacienteID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

module.exports = {
  GetAllPacientes,
  GetPacienteByID,
  InsertPaciente,
  UpdatePaciente,
  DeletePaciente,
};
