import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { fetchWithAuth } from '../components/FetchWithAuth';
import { Row, Col, Tab, Nav, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import modalAvatar from '../assets/img/modalAvatar.png';
import { toast } from 'react-toastify';

export interface Entity {
    id: string;
    [key: string]: any;
}

interface Field {
    key: string;
    label: string;
    type: string;
    required?: boolean;
    optionsUrl?: string;
}

interface UpdateModalProps<T extends Entity> {
    open: boolean;
    onClose: () => void;
    onUpdate: (entity: T) => Promise<void>;
    entity: T;
    fields: Field[];
    title: string;
}

export const UpdateModalZones = <T extends Entity>({ open, onClose, onUpdate, entity, fields, title }: UpdateModalProps<T>) => {
    const [formData, setFormData] = useState<T>({ ...entity });
    const [dropdownData, setDropdownData] = useState<Record<string, any[]>>({});
    const [profileImage, setProfileImage] = useState<string | ArrayBuffer | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const fileInputRef = React.createRef<HTMLInputElement>();

    useEffect(() => {
        const isValid = fields.every(field => {
            const fieldValue = formData[field.key];
            const valueAsString = fieldValue != null ? String(fieldValue).trim() : '';
            return !field.required || (field.required && valueAsString !== '');
        });
        setIsFormValid(isValid);
    }, [formData, fields]);

    useEffect(() => {
        const fetchDropdownOptions = async (field: Field) => {
            if (field.optionsUrl) {
                const response = await fetchWithAuth(field.optionsUrl);
                if (response.ok) {
                    const data = await response.json();
                    setDropdownData(prev => ({ ...prev, [field.key]: data }));
                }
            }
        };

        fields.forEach(field => {
            if (field.type === 'dropdown') {
                fetchDropdownOptions(field);
            }
        });
    }, [fields]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
                setFormData({ ...formData, photo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const resetToDefaultAvatar = () => {
        setProfileImage(modalAvatar);
        setFormData({ ...formData, photo: '' });
    };

    const triggerFileSelectPopup = () => fileInputRef.current?.click();

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSaveClick = () => {
        if (!isFormValid) {
            toast.warn('Preencha todos os campos obrigatórios antes de salvar.');
            return;
        }
        handleSubmit();
    };

    const handleSubmit = async () => {
        await onUpdate(formData);
        onClose();
    };

    const typeOptions = [
        { value: 'zona', label: 'Zona' },
        { value: 'local_de_trabalho', label: 'Local de Trabalho' },
        { value: 'cantina', label: 'Cantina' },
    ];

    return (
        <Modal show={open} onHide={onClose} dialogClassName="custom-modal" size="xl">
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-scrollable">
                <Row>
                    <Col md={5}>
                        <Form.Group controlId="formName">
                            <Form.Label>
                                Nome <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <OverlayTrigger
                                placement="right"
                                overlay={<Tooltip id="tooltip-name">Campo obrigatório</Tooltip>}
                            >
                                <Form.Control
                                    type="text"
                                    className="custom-input-height custom-select-font-size"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    name="name"
                                    required
                                />
                            </OverlayTrigger>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="formAcronym">
                            <Form.Label>
                                Acrônimo <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <OverlayTrigger
                                placement="right"
                                overlay={<Tooltip id="tooltip-acronym">Campo obrigatório</Tooltip>}
                            >
                                <Form.Control
                                    type="text"
                                    className="custom-input-height custom-select-font-size"
                                    value={formData.acronym || ''}
                                    onChange={handleChange}
                                    name="acronym"
                                    required
                                />
                            </OverlayTrigger>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
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
                </Row>
                <Tab.Container defaultActiveKey="dadosGerais">
                    <Nav variant="tabs" className="nav-modal">
                        <Nav.Item>
                            <Nav.Link eventKey="dadosGerais">Dados Gerais</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="dadosComplementares">Dados Complementares</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <Tab.Content>
                        <Tab.Pane eventKey="dadosGerais">
                            <Form style={{ marginTop: 10, marginBottom: 10 }}>
                                <Row>
                                    <Col md={8}>
                                        <Form.Group controlId="formDescription">
                                            <Form.Label>Descrição</Form.Label>
                                            <Form.Control
                                                type="textarea"
                                                value={formData.description || ''}
                                                onChange={handleChange}
                                                name="description"
                                                className="custom-select-font-size textarea-large"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} className='img-modal'>
                                        <img
                                            src={profileImage || modalAvatar}
                                            alt="Profile Avatar"
                                            style={{ width: 128, height: 128, borderRadius: '50%', cursor: 'pointer' }}
                                            onDoubleClick={triggerFileSelectPopup}
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
                                        <div>
                                            <Button variant="outline-danger" onClick={resetToDefaultAvatar} size='sm' style={{ marginTop: 10 }}>
                                                Remover Foto
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Form>
                        </Tab.Pane>
                        <Tab.Pane eventKey="dadosComplementares">
                            <Form style={{ marginTop: 10, marginBottom: 10 }}>
                                <Row>
                                    {[
                                        { key: 'address', label: 'Morada', type: 'string' },
                                        { key: 'ZIPCode', label: 'Código Postal', type: 'string' },
                                        { key: 'locality', label: 'Localidade', type: 'string' },
                                        { key: 'village', label: 'Freguesia', type: 'string' },
                                        { key: 'District', label: 'Distrito', type: 'string' },
                                        { key: 'Phone', label: 'Telefone', type: 'number' },
                                        { key: 'Mobile', label: 'Telemóvel', type: 'number' },
                                        { key: 'Email', label: 'E-Mail', type: 'string' },
                                    ].map((field) => (
                                        <Col md={3}>
                                            <Form.Group controlId={`form${field.key}`}>
                                                <Form.Label>{field.label}</Form.Label>
                                                <Form.Control
                                                    type={field.type}
                                                    className="custom-input-height custom-select-font-size"
                                                    value={formData[field.key] || ''}
                                                    onChange={handleChange}
                                                    name={field.key}
                                                />
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
                <Button variant="secondary" onClick={onClose}>Fechar</Button>
                <Button variant="primary" onClick={handleSaveClick}>Guardar</Button>
            </Modal.Footer>
        </Modal >
    );
};