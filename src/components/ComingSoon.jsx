import React from 'react';

export default function ComingSoon({ title, ref_code }) {
  return (
    <div>
      <div className="page-header"><h1>{title}</h1></div>
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🚧</div>
          <h2 style={{ color: '#0d1b2a', marginBottom: 8 }}>Coming Soon</h2>
          <p style={{ color: '#9a9484', fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
            This form is being built to match the exact layout from your PDF templates.
            All fields, checkboxes, and sections from <strong>{ref_code || title}</strong> will be available here.
          </p>
          <p style={{ color: '#c9a84c', fontSize: 12, marginTop: 12 }}>
            In the meantime, you can use the PDF version from the Document Library.
          </p>
        </div>
      </div>
    </div>
  );
}
