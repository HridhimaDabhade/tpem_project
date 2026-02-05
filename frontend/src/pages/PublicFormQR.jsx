import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import '../styles/public-form-qr.css';

const API_BASE = '';

export function PublicFormQR() {
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Set QR code URL
    setQrUrl(`${API_BASE}/api/qr/public-form`);
    setLoading(false);
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'TPEML-Candidate-Form-QR.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const publicFormUrl = `${window.location.origin}/apply`;

  return (
    <Layout>
      <div className="page">
        <div className="qr-page-header">
          <h1 className="page__title">Candidate Registration QR Code</h1>
          <p className="qr-page-subtitle">
            Share this QR code with candidates to allow them to register for recruitment
          </p>
        </div>

        <div className="qr-page-content">
          {/* QR Code Card */}
          <div className="qr-display-card">
            <div className="qr-card-header">
              <h2>Scan to Apply</h2>
              <p>TPEML Recruitment 2026</p>
            </div>

            {loading ? (
              <div className="qr-loading">
                <div className="loading-spinner"></div>
                <p>Generating QR Code...</p>
              </div>
            ) : error ? (
              <div className="qr-error">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className="qr-image-container printable">
                  <img 
                    src={qrUrl} 
                    alt="Public Form QR Code" 
                    className="qr-code-image"
                    onError={() => setError('Failed to load QR code')}
                  />
                </div>

                <div className="qr-url-display">
                  <label>Direct URL:</label>
                  <div className="url-box">
                    <code>{publicFormUrl}</code>
                    <button
                      type="button"
                      className="btn-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(publicFormUrl);
                        alert('URL copied to clipboard!');
                      }}
                      title="Copy URL"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Instructions Card */}
          <div className="qr-instructions-card">
            <h3>📱 How to Use</h3>
            <div className="instructions-list">
              <div className="instruction-item">
                <span className="instruction-number">1</span>
                <div className="instruction-content">
                  <strong>Download or Print</strong>
                  <p>Save the QR code image or print it out for distribution</p>
                </div>
              </div>

              <div className="instruction-item">
                <span className="instruction-number">2</span>
                <div className="instruction-content">
                  <strong>Share with Candidates</strong>
                  <p>Display at recruitment centers or share in promotional materials</p>
                </div>
              </div>

              <div className="instruction-item">
                <span className="instruction-number">3</span>
                <div className="instruction-content">
                  <strong>Candidates Scan & Register</strong>
                  <p>They'll be taken directly to the registration form</p>
                </div>
              </div>
            </div>

            <div className="qr-actions">
              <button type="button" className="btn btn--primary" onClick={handleDownload}>
                ⬇️ Download QR Code
              </button>
              <button type="button" className="btn btn--secondary no-print" onClick={handlePrint}>
                🖨️ Print QR Code
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="qr-info-box">
            <div className="info-icon">ℹ️</div>
            <div>
              <strong>Note:</strong> This QR code links to the public candidate registration form. 
              Candidates can scan this code with any smartphone camera or QR code reader to access the form instantly. 
              No login required.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
