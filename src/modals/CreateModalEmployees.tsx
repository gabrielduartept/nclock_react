import React, { useState, useEffect, ChangeEvent } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../css/PagesStyles.css';
import { fetchWithAuth } from '../components/FetchWithAuth';
import { Tab, Row, Col, Nav, Form, Tooltip, OverlayTrigger } from 'react-bootstrap';
import modalAvatar from '../assets/img/navbar/navbar/modalAvatar.png';
import { toast } from 'react-toastify';
import { Employee } from '../helpers/Types';

// Define a interface para os itens de campo
type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// Define a interface para as propriedades do componente FieldConfig
interface FieldConfig {
    label: string;
    key: string;
    type: string;
    required?: boolean;
    optionsUrl?: string;
    validate?: (value: any) => boolean;
    errorMessage?: string;
}

// Define as propriedades do componente
interface Props<T> {
    title: string;
    open: boolean;
    onClose: () => void;
    onSave: (data: T) => void;
    fields: FieldConfig[];
    initialValues: Partial<T>;
}

// Define o componente
export const CreateModalEmployees = <T extends Record<string, any>>({ title, open, onClose, onSave, fields, initialValues }: Props<T>) => {
    const [formData, setFormData] = useState<Partial<T>>({ ...initialValues, status: true });
    const [dropdownData, setDropdownData] = useState<Record<string, any[]>>({});
    const [profileImage, setProfileImage] = useState<string | ArrayBuffer | null>(null);
    const fileInputRef = React.createRef<HTMLInputElement>();
    const [isFormValid, setIsFormValid] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Atualiza o estado do componente ao abrir o modal
    useEffect(() => {
        setFormData({ ...initialValues, status: true });
        if (initialValues.photo) {
            setProfileImage(initialValues.photo);
        } else {
            setProfileImage(null);
        }
    }, [initialValues]);

    // Atualiza o estado do componente com uma parte das validações
    useEffect(() => {
        const newErrors: Record<string, string> = {};

        const isValid = fields.every(field => {
            const fieldValue = formData[field.key];
            let valid = true;

            if (field.type === 'number' && fieldValue != null && fieldValue < 0) {
                valid = false;
                newErrors[field.key] = `${field.label} não pode ser negativo.`;
            }

            return valid;
        });

        setErrors(newErrors);
        setIsFormValid(isValid);
        validateForm();
    }, [formData, fields]);

    // Função para validar o formulário
    const validateForm = () => {
        const isValid = fields.every(field => {
            const fieldValue = formData?.[field.key];
            if (field.required) {
                if (typeof fieldValue === 'string') {
                    return fieldValue.trim() !== '';
                }
                return fieldValue !== null && fieldValue !== undefined;
            }
            return true;
        });

        const enrollNumberValid = formData.enrollNumber !== undefined && formData.enrollNumber !== null;

        setIsFormValid(isValid && enrollNumberValid);
    };

    // Função para buscar os funcionários e definir o próximo número de matrícula
    const fetchEmployeesAndSetNextEnrollNumber = async () => {
        const response = await fetchWithAuth('Employees/GetAllEmployees');
        if (response.ok) {
            const employees: Employee[] = await response.json();
            const maxEnrollNumber = employees.reduce((max: number, employee: Employee) => {
                const currentEnrollNumber = parseInt(employee.enrollNumber);
                return Math.max(max, currentEnrollNumber);
            }, 0);
            setFormData(prevState => ({
                ...prevState,
                enrollNumber: (maxEnrollNumber + 1).toString()
            }));
        } else {
            toast.error('Erro ao buscar o número de matrícula dos funcionários.');
        }
    };

    // Função para buscar as opções do dropdown
    const fetchDropdownOptions = async () => {
        try {
            const departmentsResponse = await fetchWithAuth('Departaments');
            const groupsResponse = await fetchWithAuth('Groups');
            const professionsResponse = await fetchWithAuth('Professions');
            const zonesResponse = await fetchWithAuth('Zones');
            const externalEntitiesResponse = await fetchWithAuth('ExternalEntities');
            if (departmentsResponse.ok && groupsResponse.ok && professionsResponse.ok && zonesResponse.ok && externalEntitiesResponse.ok) {
                const departments = await departmentsResponse.json();
                const groups = await groupsResponse.json();
                const professions = await professionsResponse.json();
                const zones = await zonesResponse.json();
                const externalEntities = await externalEntitiesResponse.json();
                setDropdownData({
                    departmentId: departments,
                    groupId: groups,
                    professionId: professions,
                    zoneId: zones,
                    externalEntityId: externalEntities
                });
            } else {
                return;
            }
        } catch (error) {
            console.error('Erro ao buscar os dados de departamentos e grupos', error);
        }
    };

    // Atualiza o estado do componente ao abrir o modal
    useEffect(() => {
        if (open) {
            fetchEmployeesAndSetNextEnrollNumber();
            fetchDropdownOptions();
        }
    }, [open]);

    // Função para lidar com a mudança da imagem
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const image = new Image();
                image.onload = () => {
                    let width = image.width;
                    let height = image.height;
    
                    if (width > 512 || height > 512) {
                        if (width > height) {
                            height *= 512 / width;
                            width = 512;
                        } else {
                            width *= 512 / height;
                            height = 512;
                        }
                    }
    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(image, 0, 0, width, height);
    
                    const dataUrl = canvas.toDataURL('image/png');
                    setProfileImage(dataUrl);
                    setFormData({ ...formData, photo: dataUrl });
                };
                image.src = readerEvent.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };    

    // Função para acionar o popup de seleção de arquivo
    const triggerFileSelectPopup = () => fileInputRef.current?.click();

    // Função para lidar com a mudança de campo
    const handleChange = (e: ChangeEvent<FormControlElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? Number(value) : value;
        setFormData(prevState => ({
            ...prevState,
            [name]: parsedValue
        }));

        if (name === 'name') {
            const names = value.split(' ');
            let shortName = '';
            if (names.length > 1) {
                shortName = `${names[0]} ${names[names.length - 1]}`;
            } else if (names.length === 1) {
                shortName = names[0];
            }
            setFormData(prevState => ({
                ...prevState,
                shortName: shortName
            }));
        }

        validateForm();
    };

    // Função para lidar com a mudança do dropdown
    const handleDropdownChange = (key: string, e: React.ChangeEvent<FormControlElement>) => {
        const { value } = e.target;
        const selectedOption = dropdownData[key]?.find((option: any) => {
            switch (key) {
                case 'departmentId':
                    return option.departmentID === value;
                case 'groupId':
                    return option.groupID === value;
                case 'professionId':
                    return option.professionID === value;
                case 'zoneId':
                    return option.zoneID === value;
                case 'externalEntityId':
                    return option.externalEntityID === value;
                default:
                    return false;
            }
        });

        if (selectedOption) {
            const idKey = key;
            setFormData(prevState => ({
                ...prevState,
                [idKey]: value
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [key]: value
            }));
        }
    };

    // Função para lidar com o fechamento do modal
    const handleClose = () => {
        setFormData({});
        setProfileImage(null);
        onClose();
    }

    // Função para lidar com o clique no botão de salvar
    const handleSaveClick = () => {
        if (!isFormValid) {
            toast.warn('Preencha todos os campos obrigatórios antes de salvar.');
            return;
        }
        handleSave();
    };

    // Função para lidar com o salvamento
    const handleSave = () => {
        onSave(formData as T);
    };

    // Opções do tipo
    const typeOptions = [
        { value: 'Funcionário', label: 'Funcionário' },
        { value: 'Funcionário Externo', label: 'Funcionário Externo' },
        { value: 'Utente', label: 'Utente' },
        { value: 'Visitante', label: 'Visitante' },
        { value: 'Contacto', label: 'Contacto' },
        { value: 'Provisório', label: 'Provisório' }
    ];

    return (
        <Modal show={open} onHide={onClose} dialogClassName="custom-modal" size="xl">
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-scrollable">
                <Row style={{ marginBottom: 20 }}>
                    <Col md={3} className='img-modal'>
                        <img
                            src={profileImage || modalAvatar}
                            alt="Profile Avatar"
                            style={{ width: 128, height: 128, borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }}
                            onClick={triggerFileSelectPopup}
                        />
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                                ref={fileInputRef}
                            />
                        </div>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="formEnrollNumber">
                            <Form.Label>
                                Número de Matrícula <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <OverlayTrigger
                                placement="right"
                                overlay={<Tooltip id="tooltip-enrollNumber">Campo obrigatório</Tooltip>}
                            >
                                <Form.Control
                                    type="number"
                                    className="custom-input-height custom-select-font-size"
                                    value={formData.enrollNumber || ''}
                                    onChange={handleChange}
                                    name="enrollNumber"
                                />
                            </OverlayTrigger>
                            {errors.enrollNumber && <Form.Text className="text-danger">{errors.enrollNumber}</Form.Text>}
                        </Form.Group>
                        <Form.Group controlId="formName">
                            <Form.Label>
                                Nome <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <OverlayTrigger
                                placement="right"
                                overlay={<Tooltip id="tooltip-name">Campo obrigatório</Tooltip>}
                            >
                                <Form.Control
                                    type="string"
                                    className="custom-input-height custom-select-font-size"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    name="name"
                                    required
                                />
                            </OverlayTrigger>
                        </Form.Group>
                        <Form.Group controlId="formShortName">
                            <Form.Label>
                                Nome Resumido <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <OverlayTrigger
                                placement="right"
                                overlay={<Tooltip id="tooltip-shortName">Campo obrigatório</Tooltip>}
                            >
                                <Form.Control
                                    type="string"
                                    className="custom-input-height custom-select-font-size"
                                    value={formData.shortName || ''}
                                    onChange={handleChange}
                                    name="shortName"
                                    required
                                />
                            </OverlayTrigger>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="formNameAcronym">
                            <Form.Label>Acrônimo do Nome</Form.Label>
                            <Form.Control
                                type="string"
                                className="custom-input-height custom-select-font-size"
                                value={formData.nameAcronym || ''}
                                onChange={handleChange}
                                name="nameAcronym"
                            />
                        </Form.Group>
                        <Form.Group controlId="formComments">
                            <Form.Label>Comentários</Form.Label>
                            <Form.Control
                                type="string"
                                className="custom-input-height custom-select-font-size"
                                value={formData.comments || ''}
                                onChange={handleChange}
                                name="comments"
                            />
                        </Form.Group>
                        <Form.Group controlId="formType">
                            <Form.Label>Tipo</Form.Label>
                            <Form.Control
                                as="select"
                                className="custom-input-height custom-select-font-size"
                                value={formData.type || ''}
                                onChange={handleChange}
                                name="type"
                            >
                                <option value="">Selecione...</option>
                                {typeOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="formStatus" className="d-flex align-items-center mb-3">
                            <Form.Label className="mb-0 me-2 flex-shrink-0" style={{ lineHeight: '32px' }}>Status:</Form.Label>
                            <Form.Check
                                type="switch"
                                id="custom-switch-status"
                                checked={formData.status === true}
                                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? true : false })}
                                className="ms-auto"
                                label=""
                                name="status"
                            />
                        </Form.Group>
                        <Form.Group controlId="formStatusEmail" className="d-flex align-items-center mb-3">
                            <Form.Label className="mb-0 me-2 flex-shrink-0" style={{ lineHeight: '32px' }}>Status de E-Mail:</Form.Label>
                            <Form.Check
                                type="switch"
                                id="custom-switch-status-email"
                                checked={formData.statusEmail === true}
                                onChange={(e) => setFormData({ ...formData, statusEmail: e.target.checked ? true : false })}
                                className="ms-auto"
                                label=""
                                name="statusEmail"
                            />
                        </Form.Group>
                        <Form.Group controlId="formRgptAut" className="d-flex align-items-center mb-3">
                            <Form.Label className="mb-0 me-2 flex-shrink-0" style={{ lineHeight: '32px' }}>Autorização RGPD:</Form.Label>
                            <Form.Check
                                type="switch"
                                id="custom-switch-rgpt-aut"
                                checked={formData.rgpdAut === true}
                                onChange={(e) => setFormData({ ...formData, rgpdAut: e.target.checked ? true : false })}
                                className="ms-auto"
                                label=""
                                name="rgpdAut"
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Tab.Container defaultActiveKey="dadosPessoais">
                    <Nav variant="tabs" className="nav-modal">
                        <Nav.Item>
                            <Nav.Link eventKey="dadosPessoais">Dados Pessoais</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="dadosProfissionais">Dados Profissionais</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <Tab.Content>
                        <Tab.Pane eventKey="dadosPessoais">
                            <Form style={{ marginTop: 10, marginBottom: 10 }}>
                                <Row>
                                    {[
                                        { key: 'nif', label: 'NIF', type: 'number' },
                                        { key: 'address', label: 'Morada', type: 'string' },
                                        { key: 'zipcode', label: 'Código Postal', type: 'string' },
                                        { key: 'locality', label: 'Localidade', type: 'string' },
                                        { key: 'village', label: 'Freguesia', type: 'string' },
                                        { key: 'district', label: 'Distrito', type: 'string' },
                                        { key: 'phone', label: 'Telefone', type: 'number' },
                                        { key: 'mobile', label: 'Telemóvel', type: 'number' },
                                        { key: 'email', label: 'E-Mail', type: 'email' },
                                        { key: 'birthday', label: 'Data de Nascimento', type: 'date' },
                                        { key: 'nacionality', label: 'Nacionalidade', type: 'string' },
                                        { key: 'gender', label: 'Gênero', type: 'string' }
                                    ].map((field) => (
                                        <Col md={3} key={field.key}>
                                            <Form.Group controlId={`form${field.key}`}>
                                                <Form.Label>{field.label}</Form.Label>
                                                <Form.Control
                                                    type={field.type}
                                                    className="custom-input-height custom-select-font-size"
                                                    value={formData[field.key] || ''}
                                                    onChange={handleChange}
                                                    name={field.key}
                                                />
                                                {errors[field.key] && <Form.Text className="text-danger">{errors[field.key]}</Form.Text>}
                                            </Form.Group>
                                        </Col>
                                    ))}
                                </Row>
                            </Form>
                        </Tab.Pane>
                        <Tab.Pane eventKey="dadosProfissionais">
                            <Form style={{ marginTop: 10, marginBottom: 10 }}>
                                <Row>
                                    {[
                                        { key: 'biNumber', label: 'Número de BI', type: 'string' },
                                        { key: 'biIssuance', label: 'Emissão de BI', type: 'date' },
                                        { key: 'biValidity', label: 'Validade de BI', type: 'date' },
                                        { key: 'admissionDate', label: 'Data de Admissão', type: 'date' },
                                        { key: 'exitDate', label: 'Data de Saída', type: 'date' },
                                        { key: 'departmentId', label: 'Departamento', type: 'dropdown' },
                                        { key: 'professionId', label: 'Profissão', type: 'dropdown' },
                                        { key: 'groupId', label: 'Grupo', type: 'dropdown' },
                                        { key: 'zoneId', label: 'Zona', type: 'dropdown' },
                                        { key: 'externalEntityId', label: 'Entidade Externa', type: 'dropdown' }
                                    ].map((field) => (
                                        <Col md={3} key={field.key}>
                                            <Form.Group controlId={`form${field.key}`}>
                                                <Form.Label>{field.label}</Form.Label>
                                                {field.type === 'dropdown' ? (
                                                    <Form.Control
                                                        as="select"
                                                        className="custom-input-height custom-select-font-size"
                                                        value={formData[field.key] || ''}
                                                        onChange={(e) => handleDropdownChange(field.key, e)}
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {dropdownData[field.key]?.map((option: any) => {
                                                            let optionId, optionName;
                                                            switch (field.key) {
                                                                case 'departmentId':
                                                                    optionId = option.departmentID;
                                                                    optionName = option.name;
                                                                    break;
                                                                case 'groupId':
                                                                    optionId = option.groupID;
                                                                    optionName = option.name;
                                                                    break;
                                                                case 'professionId':
                                                                    optionId = option.professionID;
                                                                    optionName = option.description;
                                                                    break;
                                                                case 'zoneId':
                                                                    optionId = option.zoneID;
                                                                    optionName = option.name;
                                                                    break;
                                                                case 'externalEntityId':
                                                                    optionId = option.externalEntityID;
                                                                    optionName = option.name;
                                                                    break;
                                                                default:
                                                                    optionId = option.id;
                                                                    optionName = option.name || option.description;
                                                                    break;
                                                            }
                                                            return (
                                                                <option key={optionId} value={optionId}>
                                                                    {optionName}
                                                                </option>
                                                            );
                                                        })}
                                                    </Form.Control>
                                                ) : (
                                                    <Form.Control
                                                        type={field.type}
                                                        className="custom-input-height custom-select-font-size"
                                                        value={formData[field.key] || ''}
                                                        onChange={handleChange}
                                                        name={field.key}
                                                    />
                                                )}
                                            </Form.Group>
                                        </Col>
                                    ))}
                                </Row>
                            </Form>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={handleClose}>Fechar</Button>
                <Button variant="outline-primary" onClick={handleSaveClick}>Guardar</Button>
            </Modal.Footer>
        </Modal>
    );
};