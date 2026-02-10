function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCsv(headers, rows) {
  const csvHeaders = headers.map(escapeCsv).join(',');
  const csvRows = rows.map(row =>
    headers.map(header => escapeCsv(row[header])).join(',')
  ).join('\n');
  return `${csvHeaders}\n${csvRows}`;
}

/* ---------------------------------- */
/* 1️⃣ ALL CANDIDATES REPORT */
/* ---------------------------------- */

export function generateAllCandidatesExcel(candidates) {
  const headers = [
    'Candidate ID',
    'Name',
    'Gender',
    'DOB',
    'Contact Number',
    'Email',
    'Residential Address',
    'State of Domicile',

    'Interview Location',
    'Interview Date',
    'Year of Recruitment',

    'College Name',
    'University Name',
    'Diploma Enrollment No',
    'Diploma Branch',
    'Diploma Passout Year',
    'Diploma Percentage',
    'Backlogs in Diploma',

    '10th Percentage',
    '10th Passout Year',
    '12th Percentage',
    '12th Passout Year',

    'Onboarding Type',
    'Status',
    'Decision',
    'Interview Notes',
    'Created At'
  ];

  const rows = candidates.map(c => ({
    'Candidate ID': c.candidate_id,
    'Name': c.name,
    'Gender': c.gender || '',
    'DOB': c.dob || '',
    'Contact Number': c.contact_no || '',
    'Email': c.email || '',
    'Residential Address': c.residential_address || '',
    'State of Domicile': c.state_of_domicile || '',

    'Interview Location': c.interview_location || '',
    'Interview Date': c.date_of_interview || '',
    'Year of Recruitment': c.year_of_recruitment || '',

    'College Name': c.college_name || '',
    'University Name': c.university_name || '',
    'Diploma Enrollment No': c.diploma_enrollment_no || '',
    'Diploma Branch': c.diploma_branch || '',
    'Diploma Passout Year': c.diploma_passout_year || '',
    'Diploma Percentage': c.diploma_percentage ?? '',
    'Backlogs in Diploma': c.any_backlog_in_diploma || '',

    '10th Percentage': c.tenth_percentage ?? '',
    '10th Passout Year': c.tenth_passout_year || '',
    '12th Percentage': c.twelfth_percentage ?? '',
    '12th Passout Year': c.twelfth_passout_year || '',

    'Onboarding Type': c.onboarding_type || '',
    'Status': c.status || '',
    'Decision': c.decision || '',
    'Interview Notes': c.interview_notes || '',
    'Created At': c.created_at || ''
  }));

  return arrayToCsv(headers, rows);
}


/* ---------------------------------- */
/* 2️⃣ BRANCH SUMMARY REPORT */
/* ---------------------------------- */

export function generateBranchSummaryExcel(candidates) {
  const summary = {};

  candidates.forEach(c => {
    const branch = c.diploma_branch || 'Unknown';

    if (!summary[branch]) {
      summary[branch] = {
        shortlisted: 0,
        rejected: 0,
        total: 0
      };
    }

    summary[branch].total += 1;

    if (c.decision === 'shortlist') {
      summary[branch].shortlisted += 1;
    } else if (c.decision === 'reject') {
      summary[branch].rejected += 1;
    }
  });

  const headers = [
    'Branch',
    'Shortlisted Count',
    'Rejected Count',
    'Grand Total'
  ];

  const rows = Object.entries(summary).map(([branch, data]) => ({
    'Branch': branch,
    'Shortlisted Count': data.shortlisted,
    'Rejected Count': data.rejected,
    'Grand Total': data.total
  }));

  return arrayToCsv(headers, rows);
}
