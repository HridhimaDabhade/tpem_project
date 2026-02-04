import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { create } from '../services/candidates';
import '../styles/onboarding.css';

const STEPS = [
  { id: 1, title: 'Personal Information', icon: '👤' },
  { id: 2, title: 'Contact Details', icon: '📧' },
  { id: 3, title: 'Qualifications', icon: '🎓' },
  { id: 4, title: 'Review & Submit', icon: '✓' },
];

const ROLE_OPTIONS = [
  'Software Engineer',
  'Senior Engineer',
  'Manager',
  'Senior Manager',
  'Team Lead',
  'Technical Lead',
  'Business Analyst',
  'Quality Analyst',
  'Designer',
  'Other',
];

export function CandidateOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    name: '',
    date_of_birth: '',
    gender: '',
    // Step 2: Contact
    email: '',
    phone: '',
    address: '',
    // Step 3: Qualifications
    qualifications: '',
    experience_years: '',
    role_applied: '',
    current_company: '',
    skills: '',
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return formData.name.trim() && formData.gender;
      case 2:
        return formData.email.trim() || formData.phone.trim();
      case 3:
        return formData.qualifications.trim() && formData.role_applied;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        qualifications: formData.qualifications.trim(),
        experience_years: formData.experience_years ? parseFloat(formData.experience_years) : undefined,
        role_applied: formData.role_applied,
      };
      const candidate = await create(payload);
      navigate(`/candidates/${encodeURIComponent(candidate.candidate_id)}`);
    } catch (err) {
      setError(err.message || 'Failed to create candidate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="onboarding">
        <div className="onboarding__container">
          {/* Header */}
          <div className="onboarding__header">
            <h1 className="onboarding__title">Candidate Onboarding</h1>
            <p className="onboarding__subtitle">Add a new candidate to the recruitment system</p>
          </div>

          {/* Progress Steps */}
          <div className="onboarding__steps">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`onboarding__step ${
                  currentStep === step.id
                    ? 'onboarding__step--active'
                    : currentStep > step.id
                    ? 'onboarding__step--completed'
                    : ''
                }`}
              >
                <div className="onboarding__step-icon">{step.icon}</div>
                <div className="onboarding__step-content">
                  <div className="onboarding__step-number">Step {step.id}</div>
                  <div className="onboarding__step-title">{step.title}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="onboarding__form">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="onboarding__form-section">
                <h2 className="onboarding__form-title">Personal Information</h2>
                <div className="onboarding__form-grid">
                  <div className="form-field">
                    <label className="form-label">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.date_of_birth}
                      onChange={(e) => updateField('date_of_birth', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">
                      Gender <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={formData.gender}
                      onChange={(e) => updateField('gender', e.target.value)}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <div className="onboarding__form-section">
                <h2 className="onboarding__form-title">Contact Details</h2>
                <div className="onboarding__form-grid">
                  <div className="form-field">
                    <label className="form-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>
                  <div className="form-field form-field--full">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-input form-textarea"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Enter complete address"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Qualifications */}
            {currentStep === 3 && (
              <div className="onboarding__form-section">
                <h2 className="onboarding__form-title">Qualifications & Experience</h2>
                <div className="onboarding__form-grid">
                  <div className="form-field">
                    <label className="form-label">
                      Highest Qualification <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.qualifications}
                      onChange={(e) => updateField('qualifications', e.target.value)}
                      placeholder="e.g., B.Tech Computer Science"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Years of Experience</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.experience_years}
                      onChange={(e) => updateField('experience_years', e.target.value)}
                      placeholder="0.0"
                      step="0.5"
                      min="0"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">
                      Role Applied For <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={formData.role_applied}
                      onChange={(e) => updateField('role_applied', e.target.value)}
                      required
                    >
                      <option value="">Select role</option>
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Current Company</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.current_company}
                      onChange={(e) => updateField('current_company', e.target.value)}
                      placeholder="Current employer (if any)"
                    />
                  </div>
                  <div className="form-field form-field--full">
                    <label className="form-label">Skills & Technologies</label>
                    <textarea
                      className="form-input form-textarea"
                      value={formData.skills}
                      onChange={(e) => updateField('skills', e.target.value)}
                      placeholder="e.g., Python, React, SQL, AWS"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="onboarding__form-section">
                <h2 className="onboarding__form-title">Review & Submit</h2>
                <div className="onboarding__review">
                  <div className="onboarding__review-section">
                    <h3 className="onboarding__review-heading">Personal Information</h3>
                    <div className="onboarding__review-grid">
                      <div className="onboarding__review-item">
                        <span className="onboarding__review-label">Name:</span>
                        <span className="onboarding__review-value">{formData.name}</span>
                      </div>
                      {formData.date_of_birth && (
                        <div className="onboarding__review-item">
                          <span className="onboarding__review-label">Date of Birth:</span>
                          <span className="onboarding__review-value">{formData.date_of_birth}</span>
                        </div>
                      )}
                      <div className="onboarding__review-item">
                        <span className="onboarding__review-label">Gender:</span>
                        <span className="onboarding__review-value">{formData.gender}</span>
                      </div>
                    </div>
                  </div>

                  <div className="onboarding__review-section">
                    <h3 className="onboarding__review-heading">Contact Details</h3>
                    <div className="onboarding__review-grid">
                      <div className="onboarding__review-item">
                        <span className="onboarding__review-label">Email:</span>
                        <span className="onboarding__review-value">{formData.email || '–'}</span>
                      </div>
                      <div className="onboarding__review-item">
                        <span className="onboarding__review-label">Phone:</span>
                        <span className="onboarding__review-value">{formData.phone || '–'}</span>
                      </div>
                      {formData.address && (
                        <div className="onboarding__review-item onboarding__review-item--full">
                          <span className="onboarding__review-label">Address:</span>
                          <span className="onboarding__review-value">{formData.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="onboarding__review-section">
                    <h3 className="onboarding__review-heading">Qualifications & Experience</h3>
                    <div className="onboarding__review-grid">
                      <div className="onboarding__review-item">
                        <span className="onboarding__review-label">Qualification:</span>
                        <span className="onboarding__review-value">{formData.qualifications}</span>
                      </div>
                      <div className="onboarding__review-item">
                        <span className="onboarding__review-label">Experience:</span>
                        <span className="onboarding__review-value">
                          {formData.experience_years ? `${formData.experience_years} years` : '–'}
                        </span>
                      </div>
                      <div className="onboarding__review-item">
                        <span className="onboarding__review-label">Role Applied:</span>
                        <span className="onboarding__review-value">{formData.role_applied}</span>
                      </div>
                      {formData.current_company && (
                        <div className="onboarding__review-item">
                          <span className="onboarding__review-label">Current Company:</span>
                          <span className="onboarding__review-value">{formData.current_company}</span>
                        </div>
                      )}
                      {formData.skills && (
                        <div className="onboarding__review-item onboarding__review-item--full">
                          <span className="onboarding__review-label">Skills:</span>
                          <span className="onboarding__review-value">{formData.skills}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && <div className="onboarding__error">{error}</div>}

            {/* Navigation Buttons */}
            <div className="onboarding__actions">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  ← Back
                </button>
              )}
              <div style={{ flex: 1 }} />
              {currentStep < 4 ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleNext}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary btn--large"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Creating Candidate...' : '✓ Submit & Create Candidate'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
