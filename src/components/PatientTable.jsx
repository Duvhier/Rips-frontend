import React from 'react';
import { Calendar, Clock, User, Hash, Users } from 'lucide-react';
import './ExcelConverter.css';

const TableSkeleton = () => (
  <div className="skeleton-table">
    <div className="skeleton-header" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="skeleton-row">
        {[...Array(5)].map((_, j) => (
          <div key={j} className="skeleton-cell" />
        ))}
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="empty-state">
    <Users className="empty-icon" size={64} />
    <h3>No hay pacientes cargados</h3>
    <p>Sube una imagen de tu agenda para comenzar</p>
  </div>
);

const PatientRow = ({ patient }) => (
  <tr className="patient-row">
    <td className="patient-cell">
      <div className="cell-content">
        <Calendar size={16} className="cell-icon" />
        {patient.fecha || 'N/A'}
      </div>
    </td>
    <td className="patient-cell">
      <div className="cell-content">
        <Clock size={16} className="cell-icon" />
        {patient.hora || 'N/A'}
      </div>
    </td>
    <td className="patient-cell">
      <div className="cell-content">
        <User size={16} className="cell-icon" />
        {patient.nombre || 'Sin nombre'}
      </div>
    </td>
    <td className="patient-cell">
      <div className="cell-content">
        <Hash size={16} className="cell-icon" />
        {patient.identidad || 'N/A'}
      </div>
    </td>
    <td className="patient-cell">
      <div className="cell-content">
        <span className="age-badge">
          {patient.edad || 'N/A'} años
        </span>
      </div>
    </td>
  </tr>
);

const PatientTable = ({ patients, isLoading }) => {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!patients || patients.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="patient-table-container">
      <table className="patient-table">
        <thead>
          <tr>
            <th>
              <Calendar size={16} />
              FECHA
            </th>
            <th>
              <Clock size={16} />
              HORA
            </th>
            <th>
              <User size={16} />
              NOMBRE
            </th>
            <th>
              <Hash size={16} />
              IDENTIDAD
            </th>
            <th>EDAD</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient, index) => (
            <PatientRow 
              key={patient.id || `patient-${index}`} 
              patient={patient} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;