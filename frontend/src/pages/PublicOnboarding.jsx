import { useState } from 'react';
import { selfOnboard } from '../services/candidates';
import {
  INTERVIEW_LOCATIONS,
  RECRUITMENT_YEARS,
  DIPLOMA_BRANCHES,
  GENDER_OPTIONS,
  BACKLOG_OPTIONS,
  STATES_OF_INDIA,
} from '../constants/onboarding';
import '../styles/onboarding.css';
import '../styles/public-onboarding.css';

const STEPS = [
  { id: 1, title: 'Interview Details', icon: '📅' },
  { id: 2, title: 'Personal Information', icon: '👤' },
  { id: 3, title: 'Contact Details', icon: '📧' },
  { id: 4, title: 'Diploma Education', icon: '🎓' },
  { id: 5, title: '10th & 12th Details', icon: '📚' },
  { id: 6, title: 'Review & Submit', icon: '✓' },
];

export function PublicOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [candidateId, setCandidateId] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Interview details
    interview_location: '',
    date_of_interview: '',
    year_of_recruitment: '',
    
    // Personal info
    name: '',
    gender: '',
    dob: '',
    
    // Contact details
    contact_no: '',
    email: '',
    residential_address: '',
    state_of_domicile: '',
    
    // Diploma education
    college_name: '',
    university_name: '',
    diploma_enrollment_no: '',
    diploma_branch: '',
    diploma_passout_year: '',
    diploma_percentage: '',
    any_backlog_in_diploma: '',
    
    // 10th & 12th education
    tenth_percentage: '',
    tenth_passout_year: '',
    twelfth_percentage: '',
    twelfth_passout_year: '',
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1: // Interview details
        return (
          formData.interview_location &&
          formData.date_of_interview &&
          formData.year_of_recruitment
        );
      case 2: // Personal info
        return formData.name.trim() && formData.gender && formData.dob;
      case 3: // Contact details
        return (
          formData.contact_no.trim() &&
          formData.email.trim() &&
          formData.residential_address.trim() &&
          formData.state_of_domicile
        );
      case 4: // Diploma education
        return (
          formData.college_name.trim() &&
          formData.university_name.trim() &&
          formData.diploma_enrollment_no.trim() &&
          formData.diploma_branch &&
          formData.diploma_passout_year.trim() &&
          formData.diploma_percentage &&
          formData.any_backlog_in_diploma
        );
      case 5: // 10th & 12th
        return (
          formData.tenth_percentage &&
          formData.tenth_passout_year.trim()
          // 12th is optional
        );
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
    if (!isStepValid(5)) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        // Interview details
        interview_location: formData.interview_location,
        date_of_interview: formData.date_of_interview,
        year_of_recruitment: formData.year_of_recruitment,
        
        // Personal info
        name: formData.name.trim(),
        gender: formData.gender,
        dob: formData.dob,
        
        // Contact details
        contact_no: formData.contact_no.trim(),
        email: formData.email.trim(),
        residential_address: formData.residential_address.trim(),
        state_of_domicile: formData.state_of_domicile,
        
        // Diploma education
        college_name: formData.college_name.trim(),
        university_name: formData.university_name.trim(),
        diploma_enrollment_no: formData.diploma_enrollment_no.trim(),
        diploma_branch: formData.diploma_branch,
        diploma_passout_year: formData.diploma_passout_year.trim(),
        diploma_percentage: parseFloat(formData.diploma_percentage),
        any_backlog_in_diploma: formData.any_backlog_in_diploma,
        
        // 10th & 12th education
        tenth_percentage: parseFloat(formData.tenth_percentage),
        tenth_passout_year: formData.tenth_passout_year.trim(),
        twelfth_percentage: formData.twelfth_percentage ? parseFloat(formData.twelfth_percentage) : undefined,
        twelfth_passout_year: formData.twelfth_passout_year ? formData.twelfth_passout_year.trim() : undefined,
      };

      const candidate = await selfOnboard(payload);
      setCandidateId(candidate.candidate_id);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderInterviewDetails();
      case 2:
        return renderPersonalInfo();
      case 3:
        return renderContactDetails();
      case 4:
        return renderDiplomaEducation();
      case 5:
        return renderTenthTwelfthDetails();
      case 6:
        return renderReview();
      default:
        return null;
    }
  };

  // Same render methods as CandidateOnboarding (reusing the logic)
  const renderInterviewDetails = () => (
    <div className="form-step">
      <h3 className="step-title">📅 Interview Details</h3>
      <div className="form-group">
        <label>
          Interview Location <span className="required">*</span>
        </label>
        <select
          value={formData.interview_location}
          onChange={(e) => updateField('interview_location', e.target.value)}
          required
        >
          <option value="">Select location</option>
          {INTERVIEW_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>
          Date of Interview <span className="required">*</span>
        </label>
        <input
          type="date"
          value={formData.date_of_interview}
          onChange={(e) => updateField('date_of_interview', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>
          Year of Recruitment <span className="required">*</span>
        </label>
        <select
          value={formData.year_of_recruitment}
          onChange={(e) => updateField('year_of_recruitment', e.target.value)}
          required
        >
          <option value="">Select year</option>
          {RECRUITMENT_YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="form-step">
      <h3 className="step-title">👤 Personal Information</h3>
      <div className="form-group">
        <label>
          Full Name <span className="required">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Enter full name"
          required
        />
      </div>

      <div className="form-group">
        <label>
          Gender <span className="required">*</span>
        </label>
        <select
          value={formData.gender}
          onChange={(e) => updateField('gender', e.target.value)}
          required
        >
          <option value="">Select gender</option>
          {GENDER_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>
          Date of Birth <span className="required">*</span>
        </label>
        <input
          type="date"
          value={formData.dob}
          onChange={(e) => updateField('dob', e.target.value)}
          required
        />
      </div>
    </div>
  );

  const renderContactDetails = () => (
    <div className="form-step">
      <h3 className="step-title">📧 Contact Details</h3>
      <div className="form-group">
        <label>
          Contact Number <span className="required">*</span>
        </label>
        <input
          type="tel"
          value={formData.contact_no}
          onChange={(e) => updateField('contact_no', e.target.value)}
          placeholder="Enter contact number"
          required
        />
      </div>

      <div className="form-group">
        <label>
          Email Address <span className="required">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="Enter email address"
          required
        />
      </div>

      <div className="form-group">
        <label>
          Residential Address <span className="required">*</span>
        </label>
        <textarea
          value={formData.residential_address}
          onChange={(e) => updateField('residential_address', e.target.value)}
          placeholder="Enter full residential address"
          rows={3}
          required
        />
      </div>

      <div className="form-group">
        <label>
          State of Domicile <span className="required">*</span>
        </label>
        <select
          value={formData.state_of_domicile}
          onChange={(e) => updateField('state_of_domicile', e.target.value)}
          required
        >
          <option value="">Select state</option>
          {STATES_OF_INDIA.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderDiplomaEducation = () => (
    <div className="form-step">
      <h3 className="step-title">🎓 Diploma Education</h3>
      <div className="form-group">
        <label>
          Name of College <span className="required">*</span>
        </label>
        <input
          type="text"
          value={formData.college_name}
          onChange={(e) => updateField('college_name', e.target.value)}
          placeholder="Enter college name"
          required
        />
      </div>

      <div className="form-group">
        <label>
          Name of University <span className="required">*</span>
        </label>
        <input
          type="text"
          value={formData.university_name}
          onChange={(e) => updateField('university_name', e.target.value)}
          placeholder="Enter university name"
          required
        />
      </div>

      <div className="form-group">
        <label>
          Diploma Enrollment Number <span className="required">*</span>
        </label>
        <input
          type="text"
          value={formData.diploma_enrollment_no}
          onChange={(e) => updateField('diploma_enrollment_no', e.target.value)}
          placeholder="Enter enrollment number"
          required
        />
      </div>

      <div className="form-group">
        <label>
          Diploma Branch <span className="required">*</span>
        </label>
        <select
          value={formData.diploma_branch}
          onChange={(e) => updateField('diploma_branch', e.target.value)}
          required
        >
          <option value="">Select branch</option>
          {DIPLOMA_BRANCHES.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>
          Diploma Pass Out Year <span className="required">*</span>
        </label>
        <input
          type="text"
          value={formData.diploma_passout_year}
          onChange={(e) => updateField('diploma_passout_year', e.target.value)}
          placeholder="e.g., 2024"
          required
        />
      </div>

      <div className="form-group">
        <label>
          Diploma Percentage (out of 100) <span className="required">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={formData.diploma_percentage}
          onChange={(e) => updateField('diploma_percentage', e.target.value)}
          placeholder="e.g., 85.5"
          required
        />
      </div>

      <div className="form-group">
        <label>
          Any Backlog in Diploma? <span className="required">*</span>
        </label>
        <select
          value={formData.any_backlog_in_diploma}
          onChange={(e) => updateField('any_backlog_in_diploma', e.target.value)}
          required
        >
          <option value="">Select option</option>
          {BACKLOG_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderTenthTwelfthDetails = () => (
    <div className="form-step">
      <h3 className="step-title">📚 10th & 12th Details</h3>
      
      <div className="education-section">
        <h4>10th Standard</h4>
        <div className="form-group">
          <label>
            10th Percentage <span className="required">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.tenth_percentage}
            onChange={(e) => updateField('tenth_percentage', e.target.value)}
            placeholder="e.g., 80.5"
            required
          />
        </div>

        <div className="form-group">
          <label>
            10th Pass Out Year <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.tenth_passout_year}
            onChange={(e) => updateField('tenth_passout_year', e.target.value)}
            placeholder="e.g., 2020"
            required
          />
        </div>
      </div>

      <div className="education-section">
        <h4>12th Standard <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>(Optional)</span></h4>
        <div className="form-group">
          <label>12th Percentage</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.twelfth_percentage}
            onChange={(e) => updateField('twelfth_percentage', e.target.value)}
            placeholder="e.g., 75.5 (or leave blank if NA)"
          />
        </div>

        <div className="form-group">
          <label>12th Pass Out Year</label>
          <input
            type="text"
            value={formData.twelfth_passout_year}
            onChange={(e) => updateField('twelfth_passout_year', e.target.value)}
            placeholder="e.g., 2022 (or leave blank if NA)"
          />
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="form-step review-step">
      <h3 className="step-title">✓ Review Your Information</h3>
      
      <div className="review-section">
        <h4>📅 Interview Details</h4>
        <div className="review-item">
          <span>Interview Location:</span>
          <strong>{formData.interview_location}</strong>
        </div>
        <div className="review-item">
          <span>Date of Interview:</span>
          <strong>{formData.date_of_interview}</strong>
        </div>
        <div className="review-item">
          <span>Year of Recruitment:</span>
          <strong>{formData.year_of_recruitment}</strong>
        </div>
      </div>

      <div className="review-section">
        <h4>👤 Personal Information</h4>
        <div className="review-item">
          <span>Name:</span>
          <strong>{formData.name}</strong>
        </div>
        <div className="review-item">
          <span>Gender:</span>
          <strong>{formData.gender}</strong>
        </div>
        <div className="review-item">
          <span>Date of Birth:</span>
          <strong>{formData.dob}</strong>
        </div>
      </div>

      <div className="review-section">
        <h4>📧 Contact Details</h4>
        <div className="review-item">
          <span>Contact Number:</span>
          <strong>{formData.contact_no}</strong>
        </div>
        <div className="review-item">
          <span>Email:</span>
          <strong>{formData.email}</strong>
        </div>
        <div className="review-item">
          <span>Address:</span>
          <strong>{formData.residential_address}</strong>
        </div>
        <div className="review-item">
          <span>State:</span>
          <strong>{formData.state_of_domicile}</strong>
        </div>
      </div>

      <div className="review-section">
        <h4>🎓 Diploma Education</h4>
        <div className="review-item">
          <span>College:</span>
          <strong>{formData.college_name}</strong>
        </div>
        <div className="review-item">
          <span>University:</span>
          <strong>{formData.university_name}</strong>
        </div>
        <div className="review-item">
          <span>Enrollment No:</span>
          <strong>{formData.diploma_enrollment_no}</strong>
        </div>
        <div className="review-item">
          <span>Branch:</span>
          <strong>{formData.diploma_branch}</strong>
        </div>
        <div className="review-item">
          <span>Pass Out Year:</span>
          <strong>{formData.diploma_passout_year}</strong>
        </div>
        <div className="review-item">
          <span>Percentage:</span>
          <strong>{formData.diploma_percentage}%</strong>
        </div>
        <div className="review-item">
          <span>Backlogs:</span>
          <strong>{formData.any_backlog_in_diploma}</strong>
        </div>
      </div>

      <div className="review-section">
        <h4>📚 10th & 12th Details</h4>
        <div className="review-item">
          <span>10th Percentage:</span>
          <strong>{formData.tenth_percentage}%</strong>
        </div>
        <div className="review-item">
          <span>10th Pass Out Year:</span>
          <strong>{formData.tenth_passout_year}</strong>
        </div>
        {formData.twelfth_percentage && (
          <>
            <div className="review-item">
              <span>12th Percentage:</span>
              <strong>{formData.twelfth_percentage}%</strong>
            </div>
            <div className="review-item">
              <span>12th Pass Out Year:</span>
              <strong>{formData.twelfth_passout_year}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="public-onboarding-container">
        <div className="success-message-container">
          <div className="success-icon">✓</div>
          <h1>Application Submitted Successfully!</h1>
          <p className="success-subtitle">
            Thank you for registering with Tata Passenger Electric Mobility Limited
          </p>
          <div className="candidate-id-box">
            <label>Your Candidate ID:</label>
            <div className="candidate-id">{candidateId}</div>
            <p className="candidate-id-note">
              Please save this ID for future reference. You will need it for your interview.
            </p>
          </div>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-onboarding-container">
      <div className="public-header">
        <div className="public-brand">
          <div className="public-brand-logo">T</div>
          <div className="public-brand-text">
            <h1>TPEML Recruitment 2026</h1>
            <p>Tata Passenger Electric Mobility Limited</p>
          </div>
        </div>
      </div>

      <div className="onboarding-container">
        <div className="onboarding-header">
          <h2>Candidate Application Form</h2>
          <p className="onboarding-subtitle">Please fill in all the required information</p>
        </div>

        {/* Step indicators */}
        <div className="steps-indicator">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`step-item ${currentStep === step.id ? 'active' : ''} ${
                currentStep > step.id ? 'completed' : ''
              }`}
            >
              <div className="step-number">{step.icon}</div>
              <div className="step-label">{step.title}</div>
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Form content */}
        <div className="form-container">{renderStep()}</div>

        {/* Navigation buttons */}
        <div className="form-actions">
          {currentStep > 1 && (
            <button type="button" onClick={handleBack} className="btn btn-secondary" disabled={submitting}>
              ← Back
            </button>
          )}
          {currentStep < STEPS.length && (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
              style={{ marginLeft: 'auto' }}
              disabled={submitting}
            >
              Next →
            </button>
          )}
          {currentStep === STEPS.length && (
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ marginLeft: 'auto' }}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
