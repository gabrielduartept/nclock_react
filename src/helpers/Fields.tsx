export const employeeFields = [
    { label: 'Número de Matrícula', key: 'enrollNumber', type: 'number', required: true },
    { label: 'Nome', key: 'name', type: 'string', required: true },
    { label: 'Nome Abreviado', key: 'shortName', type: 'string', required: true },
    { label: 'Acrônimo do Nome', key: 'nameAcronym', type: 'string', required: true },
    { label: 'Comentários', key: 'comments', type: 'string' },
    { label: 'Foto', key: 'photo', type: 'string' },
    { label: 'Morada', key: 'address', type: 'string' },
    { label: 'Código Postal', key: 'zipcode', type: 'string' },
    { label: 'Localidade', key: 'locality', type: 'string' },
    { label: 'Freguesia', key: 'village', type: 'string' },
    { label: 'Distrito', key: 'district', type: 'string' },
    { label: 'Telefone', key: 'phone', type: 'number' },
    { label: 'Telemóvel', key: 'mobile', type: 'number' },
    { label: 'E-Mail', key: 'email', type: 'string' },
    { label: 'Data de Nascimento', key: 'birthday', type: 'string' },
    { label: 'Nacionalidade', key: 'nacionality', type: 'string' },
    { label: 'Gênero', key: 'gender', type: 'string' },
    { label: 'Número de BI', key: 'biNumber', type: 'string' },
    { label: 'Emissão de BI', key: 'biIssuance', type: 'string' },
    { label: 'Validade de BI', key: 'biValidity', type: 'string' },
    { label: 'NIF', key: 'nif', type: 'number' },
    { label: 'Data de Admissão', key: 'admissionDate', type: 'string' },
    { label: 'Data de Saída', key: 'exitDate', type: 'string' },
    { label: 'Autorização RGPD', key: 'rgpdAut', type: 'string' },
    { label: 'ID do Departmento', key: 'departmentId', type: 'string' },
    { label: 'Nome do Departmento', key: 'departmentName', type: 'string' },
    { label: 'ID da Profissão', key: 'professionId', type: 'string' },
    { label: 'Nome da Profissão', key: 'professionName', type: 'string' },
    { label: 'ID da Categoria', key: 'categoryId', type: 'string' },
    { label: 'Nome da Categoria', key: 'categoryName', type: 'string' },
    { label: 'ID do Grupo', key: 'groupId', type: 'string' },
    { label: 'Nome do Grupo', key: 'groupName', type: 'string' },
    { label: 'ID da Zona', key: 'zoneId', type: 'string' },
    { label: 'Nome da Zona', key: 'zoneName', type: 'string' },
    { label: 'ID da Entidade Externa', key: 'externalEntityId', type: 'string' },
    { label: 'Nome da Entidade Externa', key: 'externalEntityName', type: 'string' },
];

export const departmentFields = [
    { label: 'Código', key: 'code', type: 'number', required: true },
    { label: 'Nome', key: 'name', type: 'string', required: true },
    { label: 'Descrição', key: 'description', type: 'string' },
    { label: 'ID de Parente', key: 'paiId', type: 'number' },
];

export const categoryFields = [
    { label: 'Código', key: 'code', type: 'number', required: true },
    { label: 'Descrição', key: 'description', type: 'string', required: true },
    { label: 'Acrônimo', key: 'acronym', type: 'string' },
];

export const externalEntityFields = [
    { label: 'Nome', key: 'name', type: 'string', required: true },
    { label: 'Comentários', key: 'comments', type: 'string' },
    { label: 'Nome Comercial', key: 'commercialName', type: 'string' },
    { label: 'Nome Responsável', key: 'responsibleName', type: 'string' },
    { label: 'Foto', key: 'photo', type: 'string' },
    { label: 'Morada', key: 'address', type: 'string' },
    { label: 'Código Postal', key: 'ZIPCode', type: 'string' },
    { label: 'Localidade', key: 'locality', type: 'string' },
    { label: 'Freguesia', key: 'village', type: 'string' },
    { label: 'Distrito', key: 'district', type: 'string' },
    { label: 'Telefone', key: 'phone', type: 'number' },
    { label: 'Telemóvel', key: 'mobile', type: 'number' },
    { label: 'E-Mail', key: 'email', type: 'string' },
    { label: 'WWW', key: 'www', type: 'string' },
    { label: 'Fax', key: 'fax', type: 'number' },
    { label: 'NIF', key: 'nif', type: 'number', required: true },
    { label: 'Data Inserida', key: 'dateInserted', type: 'string' },
    { label: 'Data Atualizada', key: 'dateUpdated', type: 'string' },
];

export const groupFields = [
    { key: 'name', label: 'Nome', type: 'string', required: true },
    { key: 'description', label: 'Descrição', type: 'string' },
    { key: 'paiId', label: 'ID de Parente', type: 'number' },
];

export const professionFields = [
    { key: 'code', label: 'Código', type: 'string', required: true },
    { key: 'description', label: 'Descrição', type: 'string', required: true },
    { key: 'acronym', label: 'Acrônimo', type: 'string' },
];

export const zoneFields = [
    { key: 'type', label: 'Tipo', type: 'string' },
    { key: 'name', label: 'Nome', type: 'string', required: true },
    { key: 'description', label: 'Descrição', type: 'string' },
    { key: 'acronym', label: 'Acrônimo', type: 'string', required: true },
    { key: 'address', label: 'Morada', type: 'string' },
    { key: 'ZIPCode', label: 'Código Postal', type: 'string' },
    { key: 'locality', label: 'Localidade', type: 'string' },
    { key: 'village', label: 'Freguesia', type: 'string' },
    { key: 'District', label: 'Distrito', type: 'string' },
    { key: 'Phone', label: 'Telefone', type: 'number' },
    { key: 'Mobile', label: 'Telemóvel', type: 'number' },
    { key: 'Email', label: 'E-Mail', type: 'string' },
];