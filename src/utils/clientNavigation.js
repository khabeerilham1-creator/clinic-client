export const openPatientFile = (patient, setActivePage) => {
  if (!patient || !setActivePage) {
    return;
  }

  localStorage.setItem("editPatient", JSON.stringify({ ...patient, isEditing: true }));
  setActivePage("patients");
};
