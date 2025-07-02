import React, { useState } from 'react';
import { Calendar, Clock, User, Building2, Settings, Save, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface Instrument {
  type: string;
  marque: string;
  modele: string;
  numeroSerie: string;
  localisation: string;
}

interface Entreprise {
  id: number;
  nom: string;
  adresse: string;
  instruments: Instrument[];
}

interface Technicien {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  zone: string;
  statut: 'actif' | 'inactif' | 'conge';
}

interface ControleEvent {
  id: string;
  date: string;
  heure: string;
  entreprise: Entreprise;
  technicien: Technicien;
  instruments: Instrument[];
  statut: 'planifie' | 'confirme' | 'reporte';
  notes?: string;
}

interface PlanificationControleProps {
  onClose: () => void;
}

const PlanificationControle: React.FC<PlanificationControleProps> = ({ onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ControleEvent | null>(null);

  // Données des entreprises avec instruments
  const entreprises: Entreprise[] = [
    {
      id: 1,
      nom: 'SOGATRA',
      adresse: 'Boulevard de la République, Libreville',
      instruments: [
        { type: 'Balance commerciale', marque: 'Mettler Toledo', modele: 'XS204', numeroSerie: 'MT2025001', localisation: 'Caisse principale' }
      ]
    },
    {
      id: 2,
      nom: 'Total Gabon',
      adresse: 'Avenue du Colonel Parant, Port-Gentil',
      instruments: [
        { type: 'Compteur carburant', marque: 'Gilbarco', modele: 'Encore 700S', numeroSerie: 'GB2025001', localisation: 'Station 1' }
      ]
    },
    {
      id: 3,
      nom: 'Casino Supermarché',
      adresse: 'Centre-ville, Libreville',
      instruments: [
        { type: 'Balance commerciale', marque: 'Mettler Toledo', modele: 'XS204', numeroSerie: 'MT2025002', localisation: 'Caisse 1' },
        { type: 'Balance commerciale', marque: 'Sartorius', modele: 'Entris', numeroSerie: 'SR2025001', localisation: 'Caisse 2' }
      ]
    },
    {
      id: 4,
      nom: 'Carrefour Immaculé',
      adresse: 'Quartier Immaculé Conception, Libreville',
      instruments: [
        { type: 'Balance commerciale', marque: 'Mettler Toledo', modele: 'XS204', numeroSerie: 'MT2025003', localisation: 'Caisse principale' }
      ]
    },
    {
      id: 5,
      nom: 'Station Total Gabon',
      adresse: 'Boulevard Triomphal, Libreville',
      instruments: [
        { type: 'Pompe à essence', marque: 'Gilbarco', modele: 'Encore 700S', numeroSerie: 'GB2025002', localisation: 'Îlot 1' }
      ]
    },
    {
      id: 6,
      nom: 'Petro-Gabon',
      adresse: 'Route de l\'Aéroport, Libreville',
      instruments: [
        { type: 'Pompe à essence', marque: 'Wayne', modele: 'Helix 6000', numeroSerie: 'WY2025001', localisation: 'Îlot principal' }
      ]
    },
    {
      id: 7,
      nom: 'ETS-Jean Pneu',
      adresse: 'Quartier Akanda, Libreville',
      instruments: [
        { type: 'Manomètre à pression', marque: 'Bourdon Haenni', modele: 'BH-250', numeroSerie: 'BH2025001', localisation: 'Atelier principal' }
      ]
    }
  ];

  // Données des techniciens
  const techniciens: Technicien[] = [
    { id: 1, nom: 'MBADINGA', prenom: 'Jean-Claude', role: 'Inspecteur', zone: 'Libreville Nord', statut: 'actif' },
    { id: 2, nom: 'BONGO', prenom: 'Marie-Claire', role: 'Superviseur', zone: 'Port-Gentil', statut: 'actif' },
    { id: 3, nom: 'NDONG', prenom: 'Martin', role: 'Inspecteur', zone: 'Libreville Sud', statut: 'actif' },
    { id: 4, nom: 'MIGUELI', prenom: 'Paul', role: 'Technicien Qualité', zone: 'Libreville', statut: 'actif' },
    { id: 5, nom: 'MBA EKOMY', prenom: 'Jean', role: 'Technicien Métrologie Légale', zone: 'Libreville', statut: 'actif' },
    { id: 6, nom: 'KOUMBA', prenom: 'Jérome', role: 'Technicien Métrologie Légale', zone: 'Libreville', statut: 'conge' },
    { id: 7, nom: 'DIESSIEMOU', prenom: 'Gildas', role: 'Technicien Métrologie Légale', zone: 'Libreville', statut: 'actif' },
    { id: 8, nom: 'OYINI', prenom: 'Viviane', role: 'Technicien Métrologie Légale', zone: 'Libreville', statut: 'actif' },
    { id: 9, nom: 'PENDY', prenom: 'Vanessa', role: 'Technicien Métrologie Légale', zone: 'Libreville', statut: 'actif' }
  ];

  // Événements de contrôle existants
  const [controleEvents, setControleEvents] = useState<ControleEvent[]>([
    {
      id: '1',
      date: '2025-01-16',
      heure: '09:00',
      entreprise: entreprises[0],
      technicien: techniciens[0],
      instruments: entreprises[0].instruments,
      statut: 'planifie',
      notes: 'Contrôle de routine'
    },
    {
      id: '2',
      date: '2025-01-17',
      heure: '14:00',
      entreprise: entreprises[1],
      technicien: techniciens[1],
      instruments: entreprises[1].instruments,
      statut: 'confirme',
      notes: 'Contrôle urgent suite à réclamation'
    },
    {
      id: '3',
      date: '2025-01-18',
      heure: '10:30',
      entreprise: entreprises[2],
      technicien: techniciens[2],
      instruments: entreprises[2].instruments.slice(0, 1),
      statut: 'planifie'
    }
  ]);

  // État du formulaire de nouveau contrôle
  const [nouveauControle, setNouveauControle] = useState({
    date: '',
    heure: '',
    entrepriseId: '',
    technicienId: '',
    instrumentsSelectionnes: [] as string[],
    notes: ''
  });

  // Fonctions utilitaires pour le calendrier
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date: string) => {
    return controleEvents.filter(event => event.date === date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = formatDate(clickedDate);
    setSelectedDate(dateString);
    setNouveauControle(prev => ({ ...prev, date: dateString }));
    setShowEventModal(true);
  };

  const handleSubmitControle = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nouveauControle.entrepriseId || !nouveauControle.technicienId || !nouveauControle.date || !nouveauControle.heure) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const entreprise = entreprises.find(e => e.id === parseInt(nouveauControle.entrepriseId));
    const technicien = techniciens.find(t => t.id === parseInt(nouveauControle.technicienId));

    if (!entreprise || !technicien) {
      alert('Entreprise ou technicien non trouvé');
      return;
    }

    const instrumentsSelectionnes = entreprise.instruments.filter((_, index) => 
      nouveauControle.instrumentsSelectionnes.includes(index.toString())
    );

    if (instrumentsSelectionnes.length === 0) {
      alert('Veuillez sélectionner au moins un instrument');
      return;
    }

    const newEvent: ControleEvent = {
      id: Date.now().toString(),
      date: nouveauControle.date,
      heure: nouveauControle.heure,
      entreprise,
      technicien,
      instruments: instrumentsSelectionnes,
      statut: 'planifie',
      notes: nouveauControle.notes
    };

    setControleEvents(prev => [...prev, newEvent]);
    
    // Réinitialiser le formulaire
    setNouveauControle({
      date: '',
      heure: '',
      entrepriseId: '',
      technicienId: '',
      instrumentsSelectionnes: [],
      notes: ''
    });
    setShowEventModal(false);
  };

  const handleInstrumentToggle = (index: string) => {
    setNouveauControle(prev => ({
      ...prev,
      instrumentsSelectionnes: prev.instrumentsSelectionnes.includes(index)
        ? prev.instrumentsSelectionnes.filter(i => i !== index)
        : [...prev.instrumentsSelectionnes, index]
    }));
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'bg-orange-100 text-orange-800';
      case 'confirme': return 'bg-green-100 text-green-800';
      case 'reporte': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'Planifié';
      case 'confirme': return 'Confirmé';
      case 'reporte': return 'Reporté';
      default: return statut;
    }
  };

  // Générer les jours du calendrier
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Jours vides au début
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const entrepriseSelectionnee = entreprises.find(e => e.id === parseInt(nouveauControle.entrepriseId));

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>Planification des Contrôles</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="planning-container">
          {/* Calendrier */}
          <div className="calendar-section">
            <div className="calendar-header">
              <button onClick={() => navigateMonth('prev')} className="btn-icon">
                <ChevronLeft size={20} />
              </button>
              <h3>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button onClick={() => navigateMonth('next')} className="btn-icon">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>

              <div className="calendar-days">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="calendar-day empty"></div>;
                  }

                  const dateString = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                  const events = getEventsForDate(dateString);
                  const isToday = dateString === formatDate(new Date());
                  const isSelected = dateString === selectedDate;

                  return (
                    <div
                      key={day}
                      className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${events.length > 0 ? 'has-events' : ''}`}
                      onClick={() => handleDateClick(day)}
                    >
                      <span className="day-number">{day}</span>
                      {events.length > 0 && (
                        <div className="events-indicator">
                          {events.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`event-dot ${getStatutColor(event.statut)}`}
                              title={`${event.heure} - ${event.entreprise.nom} (${event.technicien.prenom} ${event.technicien.nom})`}
                            >
                              <span className="event-time">{event.heure}</span>
                            </div>
                          ))}
                          {events.length > 2 && (
                            <div className="more-events">+{events.length - 2}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Liste des événements du jour sélectionné */}
          {selectedDate && (
            <div className="events-sidebar">
              <h3>Contrôles du {new Date(selectedDate).toLocaleDateString('fr-FR')}</h3>
              <div className="events-list">
                {getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <span className="event-time">{event.heure}</span>
                      <span className={`event-status ${getStatutColor(event.statut)}`}>
                        {getStatutLabel(event.statut)}
                      </span>
                    </div>
                    <div className="event-content">
                      <h4>{event.entreprise.nom}</h4>
                      <p className="event-tech">
                        <User size={16} />
                        {event.technicien.prenom} {event.technicien.nom}
                      </p>
                      <p className="event-instruments">
                        <Settings size={16} />
                        {event.instruments.length} instrument(s)
                      </p>
                      {event.notes && (
                        <p className="event-notes">{event.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  className="btn-primary add-event-btn"
                  onClick={() => setShowEventModal(true)}
                >
                  <Plus size={16} />
                  Nouveau contrôle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de création d'événement */}
        {showEventModal && (
          <div className="event-modal-overlay">
            <div className="event-modal">
              <div className="modal-header">
                <h3>Planifier un nouveau contrôle</h3>
                <button onClick={() => setShowEventModal(false)} className="modal-close">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitControle} className="event-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="date">Date *</label>
                    <input
                      type="date"
                      id="date"
                      value={nouveauControle.date}
                      onChange={(e) => setNouveauControle(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="heure">Heure *</label>
                    <input
                      type="time"
                      id="heure"
                      value={nouveauControle.heure}
                      onChange={(e) => setNouveauControle(prev => ({ ...prev, heure: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="entreprise">Entreprise *</label>
                    <select
                      id="entreprise"
                      value={nouveauControle.entrepriseId}
                      onChange={(e) => setNouveauControle(prev => ({ 
                        ...prev, 
                        entrepriseId: e.target.value,
                        instrumentsSelectionnes: [] // Reset instruments when changing company
                      }))}
                      required
                    >
                      <option value="">Sélectionner une entreprise</option>
                      {entreprises.map(entreprise => (
                        <option key={entreprise.id} value={entreprise.id}>
                          {entreprise.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="technicien">Technicien *</label>
                    <select
                      id="technicien"
                      value={nouveauControle.technicienId}
                      onChange={(e) => setNouveauControle(prev => ({ ...prev, technicienId: e.target.value }))}
                      required
                    >
                      <option value="">Sélectionner un technicien</option>
                      {techniciens.filter(t => t.statut === 'actif').map(technicien => (
                        <option key={technicien.id} value={technicien.id}>
                          {technicien.prenom} {technicien.nom} - {technicien.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {entrepriseSelectionnee && (
                    <div className="form-group full-width">
                      <label>Instruments à contrôler *</label>
                      <div className="instruments-selection">
                        {entrepriseSelectionnee.instruments.map((instrument, index) => (
                          <div key={index} className="instrument-checkbox">
                            <input
                              type="checkbox"
                              id={`instrument-${index}`}
                              checked={nouveauControle.instrumentsSelectionnes.includes(index.toString())}
                              onChange={() => handleInstrumentToggle(index.toString())}
                            />
                            <label htmlFor={`instrument-${index}`} className="instrument-label">
                              <div className="instrument-info">
                                <span className="instrument-type">{instrument.type}</span>
                                <span className="instrument-details">
                                  {instrument.marque} {instrument.modele} - {instrument.localisation}
                                </span>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-group full-width">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      value={nouveauControle.notes}
                      onChange={(e) => setNouveauControle(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notes additionnelles pour ce contrôle..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowEventModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    <Save size={16} />
                    Planifier le contrôle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanificationControle;