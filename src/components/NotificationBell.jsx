import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nouvelle réservation confirmée", time: "Il y a 5 min", unread: true, type: "reservation", link: "/reservations" },
    { id: 2, text: "Le client Jean Dupont a été ajouté", time: "Il y a 2h", unread: false, type: "client", link: "/clients" },
    { id: 3, text: "Paiement de 450€ reçu", time: "Hier", unread: false, type: "payment", link: "/reservations" }
  ]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setIsOpen(false);
    navigate(notif.link);
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button 
        className="notification-bell" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color)' }}>
                Aucune notification
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${notif.unread ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notification-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}>
                    <Bell size={18} />
                  </div>
                  <div className="notification-content">
                    <div className="notification-text">{notif.text}</div>
                    <div className="notification-time">{notif.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
