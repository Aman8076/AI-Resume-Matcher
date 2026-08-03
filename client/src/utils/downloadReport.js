import jsPDF from "jspdf";

const downloadReport = (resume) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("AI Resume Analysis Report", 20, 20);

    doc.setFontSize(14);
    doc.text(`Filename: ${resume.filename}`, 20, 40);
    doc.text(`ATS Score: ${resume.atsScore}/100`, 20, 50);

    doc.setFontSize(12);

    const lines = doc.splitTextToSize(resume.analysis, 170);

    doc.text(lines, 20, 70);

    doc.save(`${resume.filename}.pdf`);
};

export default downloadReport;