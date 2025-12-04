import { useState, useCallback } from 'react';
import { Download, FileSpreadsheet, Upload, Loader2, Sparkles, Users, Calendar, Clock, User, Hash, Copy, Check, Zap, Image } from 'lucide-react';
import ripsLogo from '../assets/rips-logo.png';
import bannerImg from '../assets/Banner.png';
import Modal from './Modal';
import LoadingOverlay from './LoadingOverlay';
import Button from './Button';
import PatientTable from './PatientTable';
import './ExcelConverter.css';

// API URL from environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Hook personalizado para procesamiento de imágenes
const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const processImage = useCallback(async (file) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => reject(new Error('Error al leer la imagen'));
        reader.readAsDataURL(file);
      });

      const response = await fetch(`${API_URL}/api/process-image`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          imageData: base64Image,
          mediaType: file.type
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      return await response.json();
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { isProcessing, error, processImage };
};

const ExcelConverter = () => {
  const [copied, setCopied] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [data, setData] = useState([]);
  
  const { isProcessing, processImage } = useImageProcessor();

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const convertToCSV = () => {
    const headers = ['FECHA', 'HORA', 'NOMBRE', 'IDENTIDAD', 'EDAD'];
    const rows = data.map(row =>
      [row.fecha, row.hora, row.nombre, row.identidad, row.edad].join('\t')
    );
    return [headers.join('\t'), ...rows].join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertToCSV());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    import('xlsx').then((XLSX) => {
      const worksheetData = [
        ['FECHA', 'HORA', 'NOMBRE', 'IDENTIDAD', 'EDAD'],
        ...data.map(row => [
          row.fecha,
          row.hora,
          row.nombre,
          row.identidad,
          row.edad
        ])
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      worksheet['!cols'] = [
        { wch: 12 },
        { wch: 8 },
        { wch: 35 },
        { wch: 15 },
        { wch: 8 }
      ];

      const headerStyle = {
        fill: { fgColor: { rgb: "4472C4" } },
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };

      const cellStyle = {
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };

      ['A1', 'B1', 'C1', 'D1', 'E1'].forEach(cell => {
        if (worksheet[cell]) {
          worksheet[cell].s = headerStyle;
        }
      });

      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const isEvenRow = (row - 1) % 2 === 0;
        const fillColor = isEvenRow ? "FFFFFF" : "F2F2F2";

        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
              ...cellStyle,
              fill: { fgColor: { rgb: fillColor } }
            };
          }
        }
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pacientes');
      XLSX.writeFile(workbook, `agenda_pacientes_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  };

  const showModal = (type, title, message) => {
    setModalState({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedImage(URL.createObjectURL(file));

    try {
      const rawPatients = await processImage(file);

      if (!Array.isArray(rawPatients)) {
        throw new Error("El backend no devolvió una lista de pacientes válida.");
      }

      if (rawPatients.length === 0) {
        showModal('warning', '⚠️ Sin Resultados', 'No se encontraron pacientes marcados en la imagen.');
        return;
      }

      const newPatients = rawPatients.map(p => ({
        fecha: p.FECHA || p.fecha || '',
        hora: p.HORA || p.hora || '',
        nombre: p.NOMBRE || p.nombre || '',
        identidad: p.IDENTIDAD || p.identidad || '',
        edad: p.EDAD || p.edad || ''
      }));

      setData(prev => [...prev, ...newPatients]);

      showModal(
        'success', 
        '✅ ¡Éxito!', 
        `Se agregaron ${newPatients.length} paciente${newPatients.length > 1 ? 's' : ''} nuevo${newPatients.length > 1 ? 's' : ''} a la agenda.`
      );

    } catch (error) {
      console.error("Error:", error);
      showModal('error', '❌ Error', `Error procesando la imagen: ${error.message}`);
    }
  };

  const clearData = () => {
    setData([]);
    setUploadedImage(null);
    showModal('info', '🗑️ Datos Limpiados', 'Todos los pacientes han sido eliminados.');
  };

  return (
    <div className="excel-converter">
      <LoadingOverlay isLoading={isProcessing} message="Procesando imagen..." />
      
      <Modal 
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />

      {/* Contenedor para centrar el contenido sin estilo de card */}
      <div className="content-container">
        {/* BANNER COMPACTO */}
        <div className="compact-banner">
          <img src={bannerImg} alt="RIPS Agenda" className="compact-banner-img" />
        </div>

        <div className="header">
          <div className="header-content">
            <img src={ripsLogo} alt="RIPS Logo" className="header-logo" />
            <div className="header-text">
              <h1 className="title">Agenda de Pacientes</h1>
              <p className="subtitle">Gestión profesional de pacientes asistidos ✓</p>
            </div>
          </div>
          <Sparkles className="sparkle-icon" />
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <Users size={20} />
            <span>Total Pacientes: <strong>{data.length}</strong></span>
          </div>
          <div className="stat-item">
            <Calendar size={20} />
            <span>Última actualización: <strong>{new Date().toLocaleDateString()}</strong></span>
          </div>
        </div>

        <div className="action-section">
          <div className="button-group">
            <label className="file-upload-button">
              <input
                type="file"
                accept="image/*,.png,.jpg,.jpeg"
                onChange={handleImageUpload}
                disabled={isProcessing}
              />
              {isProcessing ? (
                <>
                  <Loader2 className="spinner" />
                  Procesando...
                </>
              ) : (
                <>
                  <Image size={20} />
                  Agregar Pantallazo
                </>
              )}
            </label>

            <Button
              variant="outline"
              onClick={handleCopy}
              icon={copied ? Check : Copy}
              disabled={data.length === 0}
            >
              {copied ? 'Copiado!' : 'Copiar para Excel'}
            </Button>

            <Button
              variant="primary"
              onClick={handleDownload}
              icon={Download}
              disabled={data.length === 0}
            >
              Descargar CSV
            </Button>

            <Button
              variant="ghost"
              onClick={clearData}
              disabled={data.length === 0}
            >
              Limpiar Todo
            </Button>
          </div>

          <div className="file-info">
            <p className="file-hint">
              <Zap size={16} />
              Formatos soportados: PNG, JPG, JPEG (Máx. 10MB)
            </p>
          </div>
        </div>

        {uploadedImage && (
          <div className="image-preview-card">
            <div className="image-preview-header">
              <h3>📷 Última imagen procesada</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadedImage(null)}
              >
                Eliminar
              </Button>
            </div>
            <div className="image-container">
              <img 
                src={uploadedImage} 
                alt="Imagen subida" 
                className="preview-image"
                loading="lazy"
              />
            </div>
          </div>
        )}

        <div className="data-section">
          <div className="section-header">
            <h2>📋 Lista de Pacientes</h2>
            <span className="badge">{data.length} registros</span>
          </div>
          
          <PatientTable patients={data} isLoading={isProcessing} />
        </div>

        <div className="instructions-card">
          <div className="instructions-header">
            <h3>📖 Instrucciones de Uso</h3>
            <span className="helper-text">Versión 2.0</span>
          </div>
          <div className="instructions-grid">
            <div className="instruction-item">
              <div className="instruction-icon">
                <Image size={24} />
              </div>
              <div>
                <h4>1. Subir Imagen</h4>
                <p>Captura y sube la imagen de tu agenda médica</p>
              </div>
            </div>
            <div className="instruction-item">
              <div className="instruction-icon">
                <Copy size={24} />
              </div>
              <div>
                <h4>2. Copiar Datos</h4>
                <p>Copia los datos procesados para pegarlos en Excel</p>
              </div>
            </div>
            <div className="instruction-item">
              <div className="instruction-icon">
                <Download size={24} />
              </div>
              <div>
                <h4>3. Exportar</h4>
                <p>Descarga los datos en formato CSV para tu sistema</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="footer">
          <p className="footer-text">
            © {new Date().getFullYear()} RIPS Agenda System • v2.0 • 
            <span className="footer-highlight"> Procesados {data.length} pacientes</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ExcelConverter;