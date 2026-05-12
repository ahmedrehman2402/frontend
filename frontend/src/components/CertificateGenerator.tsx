import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate?: Date | string;
}

const CertificateGenerator: React.FC<CertificateProps> = ({ studentName, courseName, completionDate = new Date() }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const element = certificateRef.current;
    if (!element) return;

    try {
      // Temporarily reveal the certificate for HTML capture
      element.style.display = 'block';
      const canvas = await html2canvas(element, { scale: 2 });
      element.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${studentName.replace(/\s+/g, '_')}_${courseName.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Could not generate the certificate at this time.');
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="border-cta text-cta hover:bg-cta/10">
        <Download className="mr-2 h-4 w-4" /> Download Certificate
      </Button>

      {/* Hidden Certificate HTML intended strictly for html2canvas to scrape */}
      <div 
        ref={certificateRef} 
        style={{
          display: 'none',
          width: '800px',
          height: '600px',
          padding: '40px',
          background: '#fff',
          border: '20px solid #1a1a2e', // primary dark typical course branding
          color: '#333',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          position: 'absolute',
          left: '-9999px',
          top: '-9999px' // render far off screen
        }}
      >
        <div style={{ border: '2px solid #ccc', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '48px', color: '#1a1a2e', marginBottom: '10px' }}>CERTIFICATE OF COMPLETION</h1>
          <h3 style={{ fontSize: '24px', color: '#666', marginBottom: '40px' }}>This is presented to</h3>
          
          <h2 style={{ fontSize: '42px', borderBottom: '2px solid #ccc', paddingBottom: '10px', display: 'inline-block', margin: '0 auto 40px auto' }}>
            {studentName}
          </h2>
          
          <p style={{ fontSize: '20px', marginBottom: '20px' }}>For successfully completing the course:</p>
          <h3 style={{ fontSize: '28px', color: '#e63946', marginBottom: '40px' }}>{courseName}</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', marginTop: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ borderBottom: '1px solid #333', paddingBottom: '5px', width: '150px' }}>
                {format(new Date(completionDate), 'MMMM do, yyyy')}
              </p>
              <p style={{ fontSize: '14px', marginTop: '5px' }}>Date Completed</p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <p style={{ borderBottom: '1px solid #333', paddingBottom: '5px', width: '150px', fontStyle: 'italic', fontFamily: 'serif' }}>
                 Learn AI Pro
              </p>
              <p style={{ fontSize: '14px', marginTop: '5px' }}>Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CertificateGenerator;
