import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Download, Eye, Filter, Archive, CheckCircle, XCircle, Clock, Menu, Home, Settings, Database, Upload, Search, Edit2, Mail, X } from 'lucide-react';

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [offers, setOffers] = useState([
    {
      id: 1,
      number: 'OF/001/2025',
      clientName: 'MP Bruk&Clean',
      projectName: 'Strona WWW z CMS',
      amount: 2400,
      status: 'active',
      createdAt: '2025-01-15',
      validUntil: '2025-01-29',
      items: [
        { name: 'Projekt strony WWW', quantity: 20, unitPrice: 60 },
        { name: 'System CMS', quantity: 20, unitPrice: 60 }
      ]
    },
    {
      id: 2,
      number: 'OF/002/2025',
      clientName: 'TechStart Sp. z o.o.',
      projectName: 'Aplikacja mobilna',
      amount: 4800,
      status: 'accepted',
      createdAt: '2025-01-10',
      validUntil: '2025-01-24',
      items: [
        { name: 'Aplikacja iOS/Android', quantity: 60, unitPrice: 80 }
      ]
    },
    {
      id: 3,
      number: 'OF/003/2025',
      clientName: 'Sklep ABC',
      projectName: 'E-commerce',
      amount: 3600,
      status: 'expired',
      createdAt: '2024-12-20',
      validUntil: '2025-01-03',
      items: [
        { name: 'Sklep internetowy', quantity: 60, unitPrice: 60 }
      ]
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewOfferModal, setShowNewOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Nowa oferta - formularz
  const [newOffer, setNewOffer] = useState({
    clientName: '',
    clientContactPerson: '',
    clientEmail: '',
    clientPhone: '',
    projectName: '',
    items: [{ name: '', quantity: 1, unitPrice: 60 }]
  });

  const services = [
    { name: 'Projekt i realizacja strony WWW', defaultPrice: 60 },
    { name: 'Aplikacja webowa (React/Node.js)', defaultPrice: 80 },
    { name: 'E-commerce z panelem admin', defaultPrice: 70 },
    { name: 'System CMS dedykowany', defaultPrice: 75 },
    { name: 'Aplikacja mobilna iOS/Android', defaultPrice: 90 },
    { name: 'Integracja API zewnętrznych', defaultPrice: 70 },
    { name: 'Optymalizacja SEO', defaultPrice: 60 },
    { name: 'Audyt bezpieczeństwa', defaultPrice: 90 },
    { name: 'Konsultacja IT/architektura', defaultPrice: 60 },
    { name: 'Wsparcie techniczne miesięczne', defaultPrice: 100 }
  ];

  const statusConfig = {
    active: { label: 'Aktywna', color: '#00f0ff', icon: Clock },
    accepted: { label: 'Zaakceptowana', color: '#00ff88', icon: CheckCircle },
    rejected: { label: 'Odrzucona', color: '#ff4444', icon: XCircle },
    expired: { label: 'Przedawniona', color: '#ff9900', icon: Clock },
    archived: { label: 'Zarchiwizowana', color: '#666', icon: Archive }
  };

  // Filtrowanie i wyszukiwanie
  const filteredOffers = offers.filter(offer => {
    const matchesStatus = filterStatus === 'all' || offer.status === filterStatus;
    const matchesSearch = offer.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Statystyki
  const stats = {
    total: offers.length,
    active: offers.filter(o => o.status === 'active').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    expired: offers.filter(o => o.status === 'expired').length,
    totalValue: offers.reduce((sum, o) => sum + o.amount, 0),
    acceptedValue: offers.filter(o => o.status === 'accepted').reduce((sum, o) => sum + o.amount, 0)
  };

  const changeOfferStatus = (offerId, newStatus) => {
    setOffers(offers.map(offer =>
      offer.id === offerId ? { ...offer, status: newStatus } : offer
    ));
  };

  const deleteOffer = (offerId) => {
    if (confirm('Czy na pewno chcesz usunąć tę ofertę?')) {
      setOffers(offers.filter(offer => offer.id !== offerId));
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const addNewOffer = () => {
    const totalAmount = calculateTotal(newOffer.items);
    const newId = Math.max(...offers.map(o => o.id), 0) + 1;
    const offerNumber = `OF/${String(newId).padStart(3, '0')}/2025`;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 14);

    const offer = {
      id: newId,
      number: offerNumber,
      clientName: newOffer.clientName,
      projectName: newOffer.projectName,
      amount: totalAmount,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      validUntil: validUntil.toISOString().split('T')[0],
      items: newOffer.items,
      clientContactPerson: newOffer.clientContactPerson,
      clientEmail: newOffer.clientEmail,
      clientPhone: newOffer.clientPhone
    };

    setOffers([offer, ...offers]);
    setShowNewOfferModal(false);
    setNewOffer({
      clientName: '',
      clientContactPerson: '',
      clientEmail: '',
      clientPhone: '',
      projectName: '',
      items: [{ name: '', quantity: 1, unitPrice: 60 }]
    });
  };

  const generatePDF = (offer) => {
    const formatDate = (dateStr) => {
      return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(new Date(dateStr));
    };

    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
    }
    .header { margin-bottom: 30px; }
    .header-main { font-size: 32px; font-weight: bold; color: #000; }
    .header-sub { font-size: 16px; color: #00f0ff; margin-top: 5px; }
    .contact-bar {
      font-size: 11px;
      color: #666;
      margin-top: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .title { font-size: 24px; text-align: center; margin: 30px 0; font-weight: bold; }
    .section { margin-bottom: 25px; }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 12px;
      background-color: #f5f5f5;
      padding: 10px;
    }
    .grid-container { display: flex; margin-bottom: 8px; }
    .grid-label { width: 40%; font-weight: bold; }
    .grid-value { width: 60%; }
    .parties { display: flex; gap: 30px; }
    .party { flex: 1; }
    .party-title { font-weight: bold; margin-bottom: 8px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      border: 1px solid #ddd;
    }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #f8f8f8; font-weight: bold; }
    .total-row { font-weight: bold; background-color: #f0f0f0; }
    .conditions { line-height: 1.8; }
    .footer {
      margin-top: 40px;
      font-size: 10px;
      color: #888;
      text-align: center;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    .signature { margin-top: 40px; }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: bold;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-main">VIS-SOL</div>
    <div class="header-sub">Dedykowane rozwiązania IT</div>
    <div class="contact-bar">biuro@vis-sol.pl | 783 864 780 | vis-sol.prv.pl</div>
  </div>

  <div class="title">OFERTA HANDLOWA</div>

  <div class="section">
    <div class="section-title">Szczegóły oferty</div>
    <div class="grid-container">
      <div class="grid-label">Numer oferty:</div>
      <div class="grid-value">${offer.number}</div>
    </div>
    <div class="grid-container">
      <div class="grid-label">Data wystawienia:</div>
      <div class="grid-value">${formatDate(offer.createdAt)}</div>
    </div>
    <div class="grid-container">
      <div class="grid-label">Ważna do:</div>
      <div class="grid-value">${formatDate(offer.validUntil)}</div>
    </div>
    <div class="grid-container">
      <div class="grid-label">Status:</div>
      <div class="grid-value">
        <span class="status-badge" style="background-color: ${statusConfig[offer.status].color}20; color: ${statusConfig[offer.status].color};">
          ${statusConfig[offer.status].label}
        </span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Dane stron</div>
    <div class="parties">
      <div class="party">
        <div class="party-title">SPRZEDAWCA:</div>
        <div>VIS-SOL</div>
        <div>biuro@vis-sol.pl</div>
        <div>783 864 780</div>
      </div>
      <div class="party">
        <div class="party-title">ODBIORCA:</div>
        <div>${offer.clientName}</div>
        ${offer.clientContactPerson ? `<div>${offer.clientContactPerson}</div>` : ''}
        ${offer.clientEmail ? `<div>${offer.clientEmail}</div>` : ''}
        ${offer.clientPhone ? `<div>${offer.clientPhone}</div>` : ''}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Przedmiot oferty</div>
    <div><strong>Projekt:</strong> ${offer.projectName}</div>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">Lp.</th>
          <th>Nazwa usługi</th>
          <th style="width: 80px;">Ilość [godz.]</th>
          <th style="width: 100px;">Cena j. netto</th>
          <th style="width: 120px;">Wartość netto</th>
        </tr>
      </thead>
      <tbody>
        ${offer.items.map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.unitPrice} PLN</td>
            <td>${(item.quantity * item.unitPrice).toFixed(2)} PLN</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="4">RAZEM DO ZAPŁATY (brutto):</td>
          <td>${offer.amount.toFixed(2)} PLN</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Warunki współpracy</div>
    <div class="conditions">
      • Płatność: 50% zaliczki po akceptacji oferty, 50% po odbiorze.<br>
      • Dokument: Faktura VAT-RR (zwolnienie podmiotowe) lub rachunek.<br>
      • Termin realizacji: Indywidualnie, szacunkowo ${offer.items.reduce((sum, item) => sum + Number(item.quantity), 0)} godzin roboczych.<br>
      • Gwarancja: Rękojmia zgodnie z Kodeksem cywilnym.
    </div>
  </div>

  <div class="signature">
    Data i podpis odbiorcy: _________________________________________
  </div>

  <div class="footer">
    <div>Dziękujemy za zaufanie! Vis-Sol – Twoja wizja, nasza technologia.</div>
    <div style="margin-top: 15px;">Wygenerowano: ${new Date().toLocaleString('pl-PL')}</div>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  // === RENDEROWANIE WIDOKÓW ===

  // Dashboard z statystykami
  const DashboardView = () => (
    <div>
      <h1 style={{ fontSize: '2rem', color: '#00f0ff', marginBottom: '2rem' }}>
        Panel Główny
      </h1>

      {/* Statystyki */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <StatCard title="Wszystkie oferty" value={stats.total} color="#00f0ff" />
        <StatCard title="Aktywne" value={stats.active} color="#00f0ff" />
        <StatCard title="Zaakceptowane" value={stats.accepted} color="#00ff88" />
        <StatCard title="Przedawnione" value={stats.expired} color="#ff9900" />
        <StatCard title="Wartość wszystkich" value={`${stats.totalValue.toLocaleString()} PLN`} color="#00f0ff" />
        <StatCard title="Wartość zaakcept." value={`${stats.acceptedValue.toLocaleString()} PLN`} color="#00ff88" />
      </div>

      {/* Ostatnie oferty */}
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #333'
      }}>
        <h2 style={{ color: '#00f0ff', marginBottom: '1rem' }}>Ostatnie oferty</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {offers.slice(0, 5).map(offer => (
            <div key={offer.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#0a0a0a',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            onClick={() => {
              setSelectedOffer(offer);
              setShowDetailModal(true);
            }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#fff' }}>{offer.number}</div>
                <div style={{ fontSize: '0.9rem', color: '#999' }}>{offer.clientName} - {offer.projectName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', color: '#00f0ff' }}>{offer.amount.toLocaleString()} PLN</div>
                <StatusBadge status={offer.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Widok listy ofert (tabelaryczny)
  const OffersListView = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#00f0ff' }}>
          Lista Ofert
        </h1>
        <button
          onClick={() => setShowNewOfferModal(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#00f0ff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus size={20} />
          Nowa oferta
        </button>
      </div>

      {/* Filtry i wyszukiwarka */}
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        border: '1px solid #333'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
          {/* Filtr statusu */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
              <Filter size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0a0a0a',
                border: '1px solid #00f0ff',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '1rem'
              }}
            >
              <option value="all">Wszystkie</option>
              <option value="active">Aktywne</option>
              <option value="accepted">Zaakceptowane</option>
              <option value="rejected">Odrzucone</option>
              <option value="expired">Przedawnione</option>
              <option value="archived">Zarchiwizowane</option>
            </select>
          </div>

          {/* Wyszukiwarka */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
              <Search size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Szukaj
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj po nazwie klienta, numerze oferty, projekcie..."
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0a0a0a',
                border: '1px solid #00f0ff',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabela ofert */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #333'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#0a0a0a', borderBottom: '2px solid #00f0ff' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#00f0ff', fontWeight: 'bold' }}>Numer</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#00f0ff', fontWeight: 'bold' }}>Klient</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#00f0ff', fontWeight: 'bold' }}>Projekt</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#00f0ff', fontWeight: 'bold' }}>Kwota</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#00f0ff', fontWeight: 'bold' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#00f0ff', fontWeight: 'bold' }}>Data</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: '#00f0ff', fontWeight: 'bold' }}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredOffers.map(offer => (
              <tr key={offer.id} style={{
                borderBottom: '1px solid #333',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '1rem', color: '#fff', fontWeight: 'bold' }}>{offer.number}</td>
                <td style={{ padding: '1rem', color: '#ccc' }}>{offer.clientName}</td>
                <td style={{ padding: '1rem', color: '#ccc' }}>{offer.projectName}</td>
                <td style={{ padding: '1rem', color: '#00f0ff', fontWeight: 'bold' }}>{offer.amount.toLocaleString()} PLN</td>
                <td style={{ padding: '1rem' }}>
                  <StatusBadge status={offer.status} />
                </td>
                <td style={{ padding: '1rem', color: '#999', fontSize: '0.9rem' }}>
                  {new Date(offer.createdAt).toLocaleDateString('pl-PL')}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <ActionButton
                      icon={Eye}
                      onClick={() => {
                        setSelectedOffer(offer);
                        setShowDetailModal(true);
                      }}
                      title="Podgląd"
                    />
                    <ActionButton
                      icon={Download}
                      onClick={() => generatePDF(offer)}
                      title="Pobierz PDF"
                    />
                    <ActionButton
                      icon={Trash2}
                      onClick={() => deleteOffer(offer.id)}
                      color="#ff4444"
                      title="Usuń"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOffers.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
            Brak ofert spełniających kryteria
          </div>
        )}
      </div>
    </div>
  );

  // Modal szczegółów oferty
  const OfferDetailModal = ({ offer, onClose }) => {
    if (!offer) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '2px solid #00f0ff',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: '#1a1a1a',
            zIndex: 10
          }}>
            <h2 style={{ color: '#00f0ff', fontSize: '1.5rem' }}>
              Szczegóły oferty {offer.number}
            </h2>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '1.5rem' }}>
            {/* Informacje podstawowe */}
            <div style={{
              backgroundColor: '#0a0a0a',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#00f0ff', marginBottom: '1rem' }}>Dane klienta</h3>
              <div style={{ display: 'grid', gap: '0.5rem', color: '#ccc' }}>
                <div><strong>Firma:</strong> {offer.clientName}</div>
                {offer.clientContactPerson && <div><strong>Osoba:</strong> {offer.clientContactPerson}</div>}
                {offer.clientEmail && <div><strong>Email:</strong> {offer.clientEmail}</div>}
                {offer.clientPhone && <div><strong>Telefon:</strong> {offer.clientPhone}</div>}
                <div><strong>Projekt:</strong> {offer.projectName}</div>
                <div><strong>Data wystawienia:</strong> {new Date(offer.createdAt).toLocaleDateString('pl-PL')}</div>
                <div><strong>Ważna do:</strong> {new Date(offer.validUntil).toLocaleDateString('pl-PL')}</div>
                <div><strong>Status:</strong> <StatusBadge status={offer.status} /></div>
              </div>
            </div>

            {/* Pozycje */}
            <div style={{
              backgroundColor: '#0a0a0a',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#00f0ff', marginBottom: '1rem' }}>Pozycje oferty</h3>
              {offer.items.map((item, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  backgroundColor: '#1a1a1a',
                  marginBottom: '0.5rem',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#ccc'
                }}>
                  <span>{index + 1}. {item.name} ({item.quantity}h × {item.unitPrice} PLN)</span>
                  <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>
                    {(item.quantity * item.unitPrice).toFixed(2)} PLN
                  </span>
                </div>
              ))}
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#00f0ff',
                color: '#000',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                <span>SUMA BRUTTO:</span>
                <span>{offer.amount.toFixed(2)} PLN</span>
              </div>
            </div>

            {/* Zmiana statusu */}
            <div style={{
              backgroundColor: '#0a0a0a',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#00f0ff', marginBottom: '1rem' }}>Zarządzanie statusem</h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <StatusButton
                  label="Aktywna"
                  status="active"
                  current={offer.status}
                  onClick={() => changeOfferStatus(offer.id, 'active')}
                />
                <StatusButton
                  label="Zaakceptowana"
                  status="accepted"
                  current={offer.status}
                  onClick={() => changeOfferStatus(offer.id, 'accepted')}
                />
                <StatusButton
                  label="Odrzucona"
                  status="rejected"
                  current={offer.status}
                  onClick={() => changeOfferStatus(offer.id, 'rejected')}
                />
                <StatusButton
                  label="Przedawniona"
                  status="expired"
                  current={offer.status}
                  onClick={() => changeOfferStatus(offer.id, 'expired')}
                />
                <StatusButton
                  label="Archiwizuj"
                  status="archived"
                  current={offer.status}
                  onClick={() => {
                    changeOfferStatus(offer.id, 'archived');
                    // Tutaj można dodać integrację z Google Drive
                    alert('Oferta została zarchiwizowana. W pełnej wersji zostanie przesłana do Google Drive.');
                  }}
                />
              </div>
            </div>

            {/* Akcje */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => generatePDF(offer)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#00f0ff',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Download size={20} />
                Pobierz PDF
              </button>
              <button
                onClick={() => {
                  // Symulacja wysyłki email
                  alert(`Email z ofertą ${offer.number} zostanie wysłany do: ${offer.clientEmail || 'klient@firma.pl'}`);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#00f0ff',
                  border: '1px solid #00f0ff',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Mail size={20} />
                Wyślij email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal nowej oferty
  const NewOfferModal = () => {
    const [step, setStep] = useState(1);

    const addItem = () => {
      setNewOffer({
        ...newOffer,
        items: [...newOffer.items, { name: '', quantity: 1, unitPrice: 60 }]
      });
    };

    const removeItem = (index) => {
      const items = newOffer.items.filter((_, i) => i !== index);
      setNewOffer({ ...newOffer, items });
    };

    const updateItem = (index, field, value) => {
      const items = [...newOffer.items];
      items[index][field] = value;
      setNewOffer({ ...newOffer, items });
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '2px solid #00f0ff',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: '#1a1a1a',
            zIndex: 10
          }}>
            <h2 style={{ color: '#00f0ff', fontSize: '1.5rem' }}>
              Nowa oferta - Krok {step}/2
            </h2>
            <button
              onClick={() => {
                setShowNewOfferModal(false);
                setStep(1);
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <X size={24} />
            </button>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {step === 1 && (
              <div>
                <h3 style={{ color: '#00f0ff', marginBottom: '1.5rem' }}>Dane klienta</h3>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <input
                    type="text"
                    value={newOffer.clientName}
                    onChange={(e) => setNewOffer({...newOffer, clientName: e.target.value})}
                    placeholder="Nazwa firmy *"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={newOffer.clientContactPerson}
                    onChange={(e) => setNewOffer({...newOffer, clientContactPerson: e.target.value})}
                    placeholder="Osoba kontaktowa *"
                    style={inputStyle}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input
                      type="email"
                      value={newOffer.clientEmail}
                      onChange={(e) => setNewOffer({...newOffer, clientEmail: e.target.value})}
                      placeholder="Email *"
                      style={inputStyle}
                    />
                    <input
                      type="tel"
                      value={newOffer.clientPhone}
                      onChange={(e) => setNewOffer({...newOffer, clientPhone: e.target.value})}
                      placeholder="Telefon *"
                      style={inputStyle}
                    />
                  </div>
                  <input
                    type="text"
                    value={newOffer.projectName}
                    onChange={(e) => setNewOffer({...newOffer, projectName: e.target.value})}
                    placeholder="Nazwa projektu *"
                    style={inputStyle}
                  />
                  <button
                    onClick={() => setStep(2)}
                    disabled={!newOffer.clientName || !newOffer.projectName}
                    style={{
                      ...buttonStyle,
                      opacity: (!newOffer.clientName || !newOffer.projectName) ? 0.5 : 1
                    }}
                  >
                    Dalej →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ color: '#00f0ff', marginBottom: '1.5rem' }}>Pozycje oferty</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  {newOffer.items.map((item, index) => (
                    <div key={index} style={{
                      backgroundColor: '#0a0a0a',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                        <select
                          value={item.name}
                          onChange={(e) => {
                            const selected = services.find(s => s.name === e.target.value);
                            updateItem(index, 'name', e.target.value);
                            if (selected) updateItem(index, 'unitPrice', selected.defaultPrice);
                          }}
                          style={inputStyle}
                        >
                          <option value="">Wybierz usługę...</option>
                          {services.map(service => (
                            <option key={service.name} value={service.name}>
                              {service.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          placeholder="Godz."
                          min="1"
                          style={inputStyle}
                        />
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                          placeholder="Cena"
                          min="0"
                          style={inputStyle}
                        />
                        <button
                          onClick={() => removeItem(index)}
                          disabled={newOffer.items.length === 1}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: '#ff4444',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            opacity: newOffer.items.length === 1 ? 0.3 : 1
                          }}
                        >
                          <Trash2 size={20} color="#fff" />
                        </button>
                      </div>
                      <div style={{ marginTop: '0.5rem', textAlign: 'right', color: '#00f0ff', fontWeight: 'bold' }}>
                        {(item.quantity * item.unitPrice).toFixed(2)} PLN
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={addItem} style={{
                  ...buttonStyle,
                  backgroundColor: 'transparent',
                  border: '1px solid #00f0ff',
                  color: '#00f0ff',
                  marginBottom: '1.5rem'
                }}>
                  <Plus size={20} style={{ marginRight: '0.5rem' }} />
                  Dodaj pozycję
                </button>

                <div style={{
                  backgroundColor: '#00f0ff',
                  color: '#000',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  textAlign: 'right',
                  marginBottom: '1.5rem'
                }}>
                  SUMA: {calculateTotal(newOffer.items).toFixed(2)} PLN
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setStep(1)} style={{
                    ...buttonStyle,
                    backgroundColor: 'transparent',
                    border: '1px solid #00f0ff',
                    color: '#00f0ff'
                  }}>
                    ← Wstecz
                  </button>
                  <button
                    onClick={addNewOffer}
                    disabled={newOffer.items.some(item => !item.name)}
                    style={{
                      ...buttonStyle,
                      flex: 1,
                      opacity: newOffer.items.some(item => !item.name) ? 0.5 : 1
                    }}
                  >
                    Utwórz ofertę
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Widok ustawień
  const SettingsView = () => (
    <div>
      <h1 style={{ fontSize: '2rem', color: '#00f0ff', marginBottom: '2rem' }}>
        Ustawienia
      </h1>

      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #333',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ color: '#00f0ff', marginBottom: '1.5rem' }}>Integracje</h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 'bold', color: '#fff' }}>Google Drive</div>
              <div style={{ fontSize: '0.9rem', color: '#999' }}>Automatyczna archiwizacja ofert zaakceptowanych</div>
            </div>
            <button style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#00f0ff',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              Połącz
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 'bold', color: '#fff' }}>Gmail / SMTP</div>
              <div style={{ fontSize: '0.9rem', color: '#999' }}>Automatyczne wysyłanie ofert do klientów</div>
            </div>
            <button style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: 'transparent',
              color: '#00f0ff',
              border: '1px solid #00f0ff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              Konfiguruj
            </button>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #333'
      }}>
        <h3 style={{ color: '#00f0ff', marginBottom: '1.5rem' }}>Szablon oferty</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <input type="text" placeholder="Nazwa firmy" defaultValue="VIS-SOL" style={inputStyle} />
          <input type="email" placeholder="Email kontaktowy" defaultValue="biuro@vis-sol.pl" style={inputStyle} />
          <input type="tel" placeholder="Telefon" defaultValue="783 864 780" style={inputStyle} />
          <input type="text" placeholder="Strona WWW" defaultValue="vis-sol.prv.pl" style={inputStyle} />
          <button style={buttonStyle}>Zapisz zmiany</button>
        </div>
      </div>
    </div>
  );

  // === KOMPONENTY POMOCNICZE ===

  const StatCard = ({ title, value, color }) => (
    <div style={{
      backgroundColor: '#1a1a1a',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #333',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '0.9rem', color: '#999', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        backgroundColor: `${config.color}20`,
        color: config.color
      }}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const ActionButton = ({ icon: Icon, onClick, color = '#00f0ff', title }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: '0.5rem',
        backgroundColor: 'transparent',
        border: `1px solid ${color}`,
        borderRadius: '6px',
        cursor: 'pointer',
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${color}20`}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <Icon size={18} />
    </button>
  );

  const StatusButton = ({ label, status, current, onClick }) => {
    const config = statusConfig[status];
    const isActive = current === status;

    return (
      <button
        onClick={onClick}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: isActive ? config.color : 'transparent',
          color: isActive ? '#000' : config.color,
          border: `1px solid ${config.color}`,
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
      >
        {label}
      </button>
    );
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#0a0a0a',
    border: '1px solid #00f0ff',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '1rem'
  };

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#00f0ff',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // === RENDER GŁÓWNY ===

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#f0f0f0',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '250px',
        backgroundColor: '#1a1a1a',
        borderRight: '1px solid #333',
        padding: '2rem 1rem'
      }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#00f0ff', fontWeight: '700' }}>
            VIS-SOL
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#999' }}>OfferFlow System</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavButton
            icon={Home}
            label="Dashboard"
            active={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
          />
          <NavButton
            icon={FileText}
            label="Lista ofert"
            active={currentView === 'offers'}
            onClick={() => setCurrentView('offers')}
          />
          <NavButton
            icon={Database}
            label="Archiwum"
            active={currentView === 'archive'}
            onClick={() => setCurrentView('archive')}
          />
          <NavButton
            icon={Settings}
            label="Ustawienia"
            active={currentView === 'settings'}
            onClick={() => setCurrentView('settings')}
          />
        </nav>

        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '1rem',
          right: '1rem',
          padding: '1rem',
          backgroundColor: '#0a0a0a',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem' }}>Wersja demo</div>
          <div style={{ fontSize: '0.75rem', color: '#666' }}>
            Pełna integracja z Google Drive dostępna w wersji PRO
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', padding: '2rem' }}>
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'offers' && <OffersListView />}
        {currentView === 'archive' && <OffersListView />}
        {currentView === 'settings' && <SettingsView />}
      </div>

      {/* Modals */}
      {showNewOfferModal && <NewOfferModal />}
      {showDetailModal && <OfferDetailModal offer={selectedOffer} onClose={() => setShowDetailModal(false)} />}
    </div>
  );
};

const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      backgroundColor: active ? '#00f0ff20' : 'transparent',
      color: active ? '#00f0ff' : '#999',
      border: active ? '1px solid #00f0ff' : '1px solid transparent',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: active ? 'bold' : 'normal',
      textAlign: 'left',
      transition: 'all 0.2s',
      width: '100%'
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = '#ffffff10';
        e.currentTarget.style.color = '#fff';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#999';
      }
    }}
  >
    <Icon size={20} />
    {label}
  </button>
);

export default App;
