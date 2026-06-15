import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../services/api';

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendrier = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const [resResponse, clientsResponse, chambresResponse] = await Promise.all([
          api.get('/reservations'),
          api.get('/clients'),
          api.get('/chambres')
        ]);

        const clients = clientsResponse.data;
        const chambres = chambresResponse.data;

        const getClientName = (id) => {
          if (!id) return 'Unknown Client';
          const clientId = typeof id === 'object' ? id._id || id.id : id;
          const c = clients.find(c => c._id === clientId || c.id === clientId);
          return c ? `${c.nom} ${c.prenom}` : 'Unknown Client';
        };

        const getChambreNumero = (id) => {
          if (!id) return 'Unknown';
          const chambreId = typeof id === 'object' ? id._id || id.id : id;
          const c = chambres.find(c => c._id === chambreId || c.id === chambreId);
          return c ? `#${c.numero} (${c.type})` : 'Unknown';
        };

        const mappedEvents = resResponse.data.map(res => {
          const title = `${getClientName(res.clientId)} - ${getChambreNumero(res.chambreId)}`;
          return {
            title,
            start: new Date(res.dateDebut),
            end: new Date(res.dateFin),
            allDay: true,
            resource: res
          };
        });

        setEvents(mappedEvents);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading calendar...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Calendrier des Réservations</h1>
          <p style={{ color: 'var(--text-color)' }}>Vue globale des occupations de chambres</p>
        </div>
      </div>
      <div className="card" style={{ height: '70vh', padding: '1rem' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture="fr"
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
          }}
          eventPropGetter={(event) => {
            const isPaye = event.resource?.statutPaiement;
            return {
              style: {
                backgroundColor: isPaye ? '#10b981' : '#3b82f6',
                border: 'none',
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                display: 'block'
              }
            };
          }}
        />
      </div>
    </div>
  );
};

export default Calendrier;
