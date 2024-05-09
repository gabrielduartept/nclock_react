import { useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { Department, Employee, Group } from "../helpers/Types";
import { fetchWithAuth } from "../components/FetchWithAuth";
import { toast } from "react-toastify";
import { format, parse, startOfWeek, getDay, setYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Chart as ChartJS, ArcElement, PieController, Tooltip, Legend, BarElement, BarController, CategoryScale, LinearScale } from 'chart.js';
import { Carousel } from 'react-responsive-carousel';
import banner_1 from '../assets/img/carousel/banner_1.jpg';
import banner_2 from '../assets/img/carousel/banner_2.jpg';
import banner_3 from '../assets/img/carousel/banner_3.jpg';
import banner_4 from '../assets/img/carousel/banner_4.jpg';
import banner_5 from '../assets/img/carousel/banner_5.jpg';
import banner_6 from '../assets/img/carousel/banner_6.jpg';
import banner_7 from '../assets/img/carousel/banner_7.jpg';
import banner_8 from '../assets/img/carousel/banner_8.jpg';
import banner_9 from '../assets/img/carousel/banner_9.jpg';

ChartJS.register(PieController, ArcElement, BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend);

const locales = {
    'pt': ptBR,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
}

const messages = {
    allDay: 'Todo o dia',
    previous: '<',
    next: '>',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste intervalo',
    showMore: (total: number) => `+ Ver mais (${total})`
};

export const Dashboard = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [totalEmployees, setTotalEmployees] = useState<number>(0);
    const [totalDepartments, setTotalDepartments] = useState<number>(0);
    const [totalGroups, setTotalGroups] = useState<number>(0);

    const fetchEvents = async (): Promise<CalendarEvent[]> => {
        try {
            const response = await fetchWithAuth('Employees/GetAllEmployees', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) toast.error('Erro ao buscar eventos');
            const employees: Employee[] = await response.json();
            setTotalEmployees(employees.length);
            const currentYear = new Date().getFullYear();
            return employees.map(employee => {
                const birthday = new Date(employee.birthday);
                const birthdayThisYear = setYear(birthday, currentYear);
                return {
                    id: employee.id,
                    title: `Aniversário de ${employee.name}`,
                    start: birthdayThisYear,
                    end: birthdayThisYear,
                    allDay: true,
                };
            });
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            return [];
        }
    };

    const fetchDepartments = async (): Promise<void> => {
        try {
            const response = await fetchWithAuth('Departaments', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) toast.error('Erro ao buscar departamentos');
            const departments: Department[] = await response.json();
            setTotalDepartments(departments.length);
        } catch (error) {
            console.error('Erro ao buscar departamentos:', error);
        }
    };

    const fetchGroups = async (): Promise<void> => {
        try {
            const response = await fetchWithAuth('Groups', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) toast.error('Erro ao buscar grupos');
            const groups: Group[] = await response.json();
            setTotalGroups(groups.length);
        } catch (error) {
            console.error('Erro ao buscar grupos:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const employeeEvents = await fetchEvents();
            setEvents(employeeEvents);
            await fetchDepartments();
            await fetchGroups();
        } catch (error) {
            console.error("Erro ao carregar dados: ", error);
        }
    };

    return (
        <div className="dashboard-container">
            <NavBar />
            <div className="dashboard-content">
                <div className="carousel-container" style={{ flex: 1 }}>
                    <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} showArrows={false}>
                        <div>
                            <img className="img-carousel" src={banner_1} alt="Imagem 1" />
                        </div>
                        <div>
                            <img className="img-carousel" src={banner_2} alt="Imagem 2" />
                        </div>
                        <div>
                            <img className="img-carousel" src={banner_3} alt="Imagem 3" />
                        </div>
                        <div>
                            <img className="img-carousel" src={banner_4} alt="Imagem 4" />
                        </div>
                        <div>
                            <img className="img-carousel" src={banner_5} alt="Imagem 5" />
                        </div>
                        <div>
                            <img className="img-carousel" src={banner_6} alt="Imagem 6" />
                        </div>
                        <div>
                            <img className="img-carousel" src={banner_7} alt="Imagem 7" />
                        </div>
                        <div>
                            <img className="img-carousel" src={banner_8} alt="Imagem 8" />
                        </div>
                        <div>
                            <img className="img-carousel" src={banner_9} alt="Imagem 9" />
                        </div>
                    </Carousel>
                </div>
                <div className="calendar-container">
                    <div className="dashboard-calendar" style={{ flex: 1 }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            messages={messages}
                            culture="pt"
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};