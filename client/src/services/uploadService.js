export function createUploadForm(file, fieldName = 'file') {
  const form = new FormData();
  form.append(fieldName, file);
  return form;
}
