//-- arquivo apps/consultas/controller/ctlConsultas.js

const mdlConsultas = require("../model/mdlConsultas");

// Elimina parte final de uma variável data com essa: 2026-10-05T03:00:00.000Z
const formataData = (registro) => {
  for (let i = 0; i < registro.length; i++) {
    const row = registro[i];
    if (row.dataconsulta) {
      row.dataconsulta = row.dataconsulta.toISOString().split('T')[0];
    }
  }
  return registro;
};

const GetAllConsultas = (req, res) =>
  (async () => {
    let registro = await mdlConsultas.GetAllConsultas();
    res.json({ status: "ok", "registro": formataData(registro) });
  })();

const GetConsultaByID = (req, res) =>
  (async () => {
    const consultaID = parseInt(req.params.consultaid);
    let registro = await mdlConsultas.GetConsultaByID(consultaID);
    res.json({ status: "ok", "registro": formataData(registro) });
  })();

const GetPacientesToConsultas = (req, res) =>
  (async () => {
    let registro = await mdlConsultas.GetPacientesToConsultas();
    res.json({ status: "ok", "registro": registro });
  })();

const InsertConsulta = (request, res) =>
  (async () => {
    const consultaREG = request.body;
    let { msg, linhasAfetadas } = await mdlConsultas.InsertConsulta(consultaREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

const UpdateConsulta = (request, res) =>
  (async () => {
    const consultaID = parseInt(request.params.consultaid);
    const consultaREG = request.body;
    let { msg, linhasAfetadas } = await mdlConsultas.UpdateConsulta(consultaID, consultaREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

const DeleteConsulta = (request, res) =>
  (async () => {
    const consultaID = parseInt(request.params.consultaid);
    let { msg, linhasAfetadas } = await mdlConsultas.DeleteConsulta(consultaID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

module.exports = {
  GetAllConsultas,
  GetConsultaByID,
  GetPacientesToConsultas,
  InsertConsulta,
  UpdateConsulta,
  DeleteConsulta,
};
