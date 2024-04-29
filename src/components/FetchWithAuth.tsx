import { toast } from "react-toastify";

interface FetchOptions extends RequestInit {
    headers?: HeadersInit;
}

export const fetchWithAuth = async (url: string, options: FetchOptions = {}): Promise<Response> => {
    const token = localStorage.getItem('token');

    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        };
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            handleHTTPError(response);
            return response;
        }

        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Erro de rede. Por favor, verifique sua conexão ou tente novamente mais tarde.');
        throw error;
    }
};

const handleHTTPError = async (response: Response) => {

    switch (response.status) {
        case 401:
            window.location.href = '/unauthorized';
            toast.error('Você não tem permissão para acessar esta página');
            break;
        case 404:
        case 502:
        case 503:
        case 504:
            window.location.href = '/notfound';
            toast.error('Página não encontrada');
            break;
        default:
            toast.error(`Erro ao tentar executar a operação. Código de erro: ${response.status}`);
            break;
    }
};