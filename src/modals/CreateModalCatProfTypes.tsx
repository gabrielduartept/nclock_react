import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import '../css/PagesStyles.css';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../components/FetchWithAuth';

// Define a interface para as propriedades do componente FieldConfig
interface FieldConfig {
    label: string;
    key: string;
    type: string;
    required?: boolean;
    validate?: (value: any) => boolean;
    errorMessage?: string;
}

// Define a interface para as propriedades do componente CreateModalCatProf
interface Props<T> {
    title: string;
    open: boolean;
    onClose: () => void;
    onSave: (data: T) => void;
    fields: FieldConfig[];
    initialValues: Partial<T>;
    entityType: 'categorias' | 'profissões' | 'tipos';
}

// Define a interface para os itens de código
interface CodeItem {
    code: number;
}

// Define o componente
export const CreateModalCatProfTypes = <T extends Record<string, any>>({ title, open, onClose, onSave, fields, initialValues, entityType }: Props<T>) => {
    const [formData, setFormData] = useState<Partial<T>>(initialValues);
    const [isFormValid, setIsFormValid] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Usa useEffect para validar o formulário
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
    }, [formData, fields]);

    // Usa useEffect para buscar os dados de categoria/profissão
    useEffect(() => {
        if (open) {
            fetchEntityData();
        }
    }, [open]);

    // Função para buscar os dados de categoria, profissão ou tipo
    const fetchEntityData = async () => {
        let url;
        switch (entityType) {
            case 'categorias':
                url = 'Categories';
                break;
            case 'profissões':
                url = 'Professions';
                break;
            case 'tipos':
                url = 'ExternalEntityTypes';
                break;
            default:
                toast.error(`Tipo de entidade '${entityType}' não suportado.`);
                return;
        }
        try {
            const response = await fetchWithAuth(url);
            if (response.ok) {
                const data: CodeItem[] = await response.json();
                const maxCode = data.reduce((max: number, item: CodeItem) => Math.max(max, item.code), 0) + 1;
                setFormData(prevState => ({
                    ...prevState,
                    code: maxCode
                }));
            } else {
                toast.error(`Erro ao buscar dados de ${entityType}`);
                return;
            }
        } catch (error) {
            console.error(`Erro ao buscar dados de ${entityType}:`, error);
            toast.error(`Erro ao conectar ao servidor para ${entityType}`);
        }
    };

    // Função para lidar com a mudança de valor
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? Number(value) : value;
        setFormData(prevState => ({
            ...prevState,
            [name]: parsedValue
        }));
    };

    // Função para lidar com o clique em guardar
    const handleSaveClick = () => {
        if (!isFormValid) {
            toast.warn('Preencha todos os campos obrigatórios antes de guardar.');
            return;
        }
        onSave(formData as T);
    };

    return (
        <Modal show={open} onHide={onClose} dialogClassName="modal-scrollable">
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-scrollable">
                <form className="form-grid">
                    {fields.map(field => (
                        <div className="form-group" key={field.key}>
                            <label htmlFor={field.key}>
                                {field.label}
                                {field.required && (
                                    <OverlayTrigger placement="right" overlay={<Tooltip id={`tooltip-${field.key}`}>Campo obrigatório</Tooltip>}>
                                        <span style={{ color: 'red' }}> *</span>
                                    </OverlayTrigger>
                                )}
                            </label>
                            <input
                                type={field.type}
                                className="custom-input-height form-control custom-select-font-size"
                                id={field.key}
                                name={field.key}
                                value={formData[field.key] || ''}
                                onChange={handleChange}
                            />
                            {errors[field.key] && <div style={{ color: 'red', fontSize: 'small' }}>{errors[field.key]}</div>}
                        </div>
                    ))}
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose}>Fechar</Button>
                <Button variant="outline-primary" onClick={handleSaveClick} disabled={!isFormValid}>Guardar</Button>
            </Modal.Footer>
        </Modal>
    );
};