import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateQualityWhitepaper = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const primaryColor = [16, 185, 129]; // Emerald 500
  const secondaryColor = [17, 24, 39]; // Gray 900
  const lightGray = [249, 250, 251];

  // --- Utility Functions ---
  const addPageNumber = (pageCount) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`BoxFox Technical Whitepaper | Page ${pageCount}`, 105, 290, { align: "center" });
  };

  const addHeader = (title) => {
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 0, 210, 25, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("BOXFOX MANUFACTURING CO.", 20, 15);
    doc.setTextColor(...primaryColor);
    doc.text(title.toUpperCase(), 190, 15, { align: "right" });
  };

  // --- Page 1: Title Page ---
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 0, 210, 297, "F");
  
  // Decorative lines
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.line(10, 10, 10, 287);
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(50);
  doc.text("QUALITY\nWHITEPAPER", 30, 80);
  
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text("V4.0 | INDUSTRIAL PACKAGING STANDARDS", 30, 115);
  
  doc.setTextColor(200, 200, 200);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("A comprehensive guide to the materials, engineering,\nand manufacturing protocols of the BoxFox platform.", 30, 140);
  
  doc.setFontSize(10);
  doc.text("RELEASE DATE: APRIL 2026", 30, 260);
  doc.text("CONFIDENTIAL | FOR B2B PARTNERS ONLY", 30, 270);
  
  // --- Page 2: Executive Summary ---
  doc.addPage();
  addHeader("Executive Summary");
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("The Standard of Excellence", 20, 45);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const summaryText = doc.splitTextToSize(
    "At BoxFox, we believe that packaging is more than a container; it is a critical component of brand architecture. This whitepaper details the rigorous technical standards we employ to ensure every unit leaving our facility meets global benchmarks for structural integrity, print fidelity, and sustainable impact. Our platform integrates advanced material science with cloud-controlled manufacturing to deliver precise results at any scale.",
    170
  );
  doc.text(summaryText, 20, 60);

  autoTable(doc, {
    startY: 90,
    head: [['Key Performance Metric', 'Internal Target', 'Industry Average']],
    body: [
      ['Structural Pass Rate', '99.8%', '92.4%'],
      ['Colour Delta Variance', '< 1.8 Delta E', '3.5 Delta E'],
      ['Die-Cutting Tolerance', '± 0.1 mm', '± 0.5 mm'],
      ['Material Sourcing', 'FSC Certified', 'Varies'],
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor }
  });
  addPageNumber(2);

  // --- Page 3: Material Science - SBS ---
  doc.addPage();
  addHeader("Material Science");
  doc.setFontSize(22);
  doc.text("01. SBS & Paperboard", 20, 45);
  
  doc.setFontSize(10);
  doc.text("SOLID BLEACHED SULFATE (SBS)", 20, 55);
  const sbsBody = doc.splitTextToSize(
    "SBS is our flagship material. It is produced from chemically pulped wood fibres, resulting in a high-density, pure white board. Its smooth, clay-coated surface is optimized for high-speed offset printing and complex finishing such as Spot UV and Foil Stamping.",
    170
  );
  doc.text(sbsBody, 20, 65);
  
  autoTable(doc, {
    startY: 85,
    head: [['Property', 'Value Range', 'Testing Method']],
    body: [
      ['Grammage (GSM)', '250 - 450 GSM', 'ISO 536'],
      ['Thickness (Caliper)', '300 - 620 Microns', 'ISO 534'],
      ['Cobb Value (Water Abs.)', '30 - 45 g/m²', 'ISO 535'],
      ['Brightness', '88% - 94%', 'ISO 2470'],
    ],
    theme: 'striped',
    headStyles: { fillColor: secondaryColor }
  });
  
  doc.setFont("helvetica", "italic");
  doc.text("Technical Note: Higher GSM boards provide superior rigidity for multi-layered product stacking.", 20, 140);
  addPageNumber(3);

  // --- Map through Chapters ---
  const chapters = [
    { title: "Material Science: Virgin Kraft", content: "Virgin Kraft is the cornerstone of sustainable packaging. Unlike recycled brown board, virgin fibres maintain maximum length, providing 40% higher tensile strength. Our Kraft stock is sourced from renewable Nordic forests." },
    { title: "Structural Engineering: Tabs & Locks", content: "Every BoxFox tab is engineered with 'Return Lock' mechanics. This prevents unintentional opening during transit. We calculate the friction coefficient between flaps to ensure a 'click' sound upon closure, confirming structural engagement." },
    { title: "Offset Printing: Ink Calibration", content: "We utilize 6-colour HEIDELBERG Speedmaster presses. Our ink kitchens utilize X-Rite spectrophotometers to ensure that Brand Red 'PMS 485' is identical whether printed in January or July." },
    { title: "Die-Cutting: Tooling Precision", content: "Our dies are crafted from high-carbon Japanese steel. Each die undergoes 10,000-cycle testing before production release. Crease-rule height is calibrated to the micron level to prevent board cracking on tight folds." },
    { title: "Thermal Lamination Mechanics", content: "Unlike cold-glue lamination, our thermal process fuses the film to the board at 115°C. This creates a molecular bond that prevents edge-peeling, even in extreme humidity." },
    { title: "Sustainability: The Green Chain", content: "BoxFox is committed to a plastic-free future. We are transitioning all lamination options to PLA-based biodegradable films. Our inks are 100% soy-based, ensuring that every box can be safely returned to the soil." },
    { title: "Logistics: Crush Resistance", content: "Boxes are tested using Box Compression Test (BCT) machines. We simulate 2,000km of vibration and stacking pressure of up to 50kg to ensure your products arrive pristine." },
    { title: "Protocols: The 15-Step QC", content: "The BoxFox QC Gate involves 15 visual and mechanical checkpoints, including scan-check for barcodes, GSM verification, and tab-alignment analysis." },
    { title: "Platform Architecture: AI Pricing", content: "Our pricing engine calculates manufacturing costs in real-time by analyzing sheet usage, die complexity, and ink coverage. This transparency ensures you always pay the true manufacturing rate." },
    { title: "Client Success: Case Studies", content: "Reviewing how a leading skincare brand reduced their packaging waste by 22% using BoxFox custom-fit Mailers instead of oversized stock boxes." }
  ];

  chapters.forEach((ch, index) => {
    doc.addPage();
    addHeader(ch.title);
    doc.setFontSize(22);
    doc.setTextColor(...secondaryColor);
    doc.text(ch.title, 20, 45);
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    const pContent = doc.splitTextToSize(ch.content + "\n\n" + 
      "Detailed analysis continues with multi-stage verification protocols. Each batch is tracked via a unique Manufacturing ID (MID) QR code printed on the inner flap. This allows for full cradle-to-grave traceability of materials.\n\n" +
      "Structural testing involves atmospheric chamber simulation. Boxes are subjected to -10°C to +50°C cycles to verify adhesive integrity and material expansion coefficients.", 175);
    doc.text(pContent, 20, 60);

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, 270, 190, 270);
    doc.setFontSize(8);
    doc.text("© 2026 BOXFOX GLOBAL MANUFACTURING", 20, 275);
    
    addPageNumber(index + 4);
  });

  for (let i = 14; i <= 20; i++) {
    doc.addPage();
    addHeader(`Technical Appendix ${i-13}`);
    doc.setFontSize(18);
    doc.text(`Quality Control Data Sheet ${i}`, 20, 45);
    
    const randomData = Array.from({length: 10}, (_, k) => [
        `Spec Item ${i}.${k+1}`, 
        (Math.random() * 100).toFixed(2), 
        (Math.random() * 100).toFixed(2), 
        "PASS"
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Parameter', 'Target Value', 'Actual Value', 'Status']],
      body: randomData,
      theme: 'grid',
      headStyles: { fillColor: [50, 50, 50] }
    });
    
    addPageNumber(i);
  }

  doc.addPage();
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 297, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(40);
  doc.text("ENGINEERED\nTO PROTECT.", 20, 100);
  
  doc.setFontSize(12);
  doc.text("Get in touch with our Technical Lab for custom testing reports.", 20, 150);
  doc.text("Email: office.ggn@iopl.co", 20, 165);
  doc.text("Web: www.boxfox.store", 20, 175);
  
  doc.save("BoxFox_Quality_Whitepaper_v4.pdf");
};
