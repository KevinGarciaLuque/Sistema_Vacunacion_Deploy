import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoIzquierdo from "../../assets/logo_izquierdo.png";
import logoDerecho from "../../assets/logo_derecho.png";
import selloEpidemiologia from "../../assets/sello_epidemiologia.png";

export async function generarCarnetPDF({ historial, usuario, dni }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const marginX = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const formatDate = (date) => date ? new Date(date).toLocaleDateString("es-ES") : "—";

  const getBase64Image = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject("❌ Error al cargar la imagen: " + src);
    });
  };

  try {
    const [logoIzqBase64, logoDerBase64, selloBase64] = await Promise.all([
      getBase64Image(logoIzquierdo),
      getBase64Image(logoDerecho),
      getBase64Image(selloEpidemiologia),
    ]);

    const addHeader = () => {
      doc.addImage(logoIzqBase64, "PNG", marginX, 30, 80, 60);
      doc.addImage(logoDerBase64, "PNG", pageWidth - marginX - 60, 30, 60, 50);
      doc.setFontSize(22);
      doc.text("CARNET DE VACUNACIÓN", pageWidth / 2, 60, { align: "center" });
      doc.setFontSize(13);
      doc.setTextColor(120);
      doc.text(formatDate(new Date()), pageWidth / 2, 80, { align: "center" });
      doc.setTextColor(0, 0, 0);
    };

    addHeader();

    const datos = [
      [
        { content: "Nombre completo:", styles: { fontStyle: "bold" } },
        usuario?.nombre_completo || "—",
        { content: "DNI:", styles: { fontStyle: "bold" } },
        dni || "—",
      ],
      [
        { content: "Edad:", styles: { fontStyle: "bold" } },
        usuario?.edad?.toString() || "—",
        { content: "Fecha nacimiento:", styles: { fontStyle: "bold" } },
        formatDate(usuario?.fecha_nacimiento),
      ],
      [
        { content: "Teléfono:", styles: { fontStyle: "bold" } },
        usuario?.telefono || "—",
        { content: "Correo:", styles: { fontStyle: "bold" } },
        usuario?.correo || "—",
      ],
      [
        { content: "Área laboral:", styles: { fontStyle: "bold" } },
        usuario?.area_laboral || "—",
        { content: "Cargo:", styles: { fontStyle: "bold" } },
        usuario?.cargo || "—",
      ],
      [
       
        { content: "Dirección:", styles: { fontStyle: "bold" } },
        usuario?.direccion || "—",
      ],
    ];

    autoTable(doc, {
      startY: 140,
      margin: { left: marginX, right: marginX },
      body: datos,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [245, 245, 245] },
        2: { fontStyle: "bold", fillColor: [245, 245, 245] },
      },
    });

    const posY = doc.lastAutoTable.finalY + 20;

    autoTable(doc, {
      startY: posY,
      margin: { left: marginX, right: marginX },
      head: [["Dosis", "Vacuna", "Fabricante", "Fecha Aplicación", "Responsable"]],
      body: historial.length > 0
        ? historial.map((v) => [
            v.dosis || "—",
            v.nombre_vacuna || "—",
            v.fabricante || "—",
            formatDate(v.fecha_aplicacion),
            v.responsable || "—",
          ])
        : [["Sin registros", "", "", "", ""]],
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    // ✅ Agregar sello y firma
    let firmaY = doc.lastAutoTable.finalY + 30;
    const selloWidth = 180;
    const selloHeight = 180;
    const selloY = firmaY + 20;
    const selloX = marginX;

    if (pageHeight - selloY < 200) {
      doc.addPage();
      addHeader();
      firmaY = 180;
    }

    doc.addImage(selloBase64, "PNG", selloX, selloY, selloWidth, selloHeight);

    const lineaY = selloY + selloHeight - 15;
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.line(selloX + 20, lineaY, selloX + selloWidth - 20, lineaY);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Unidad de Epidemiología", selloX + 20, lineaY + 15);
    doc.setFont("helvetica", "normal");
    doc.text("Hospital María, Especialidades Pediátricas", selloX + 20, lineaY + 30);

    // ✅ Pie de página
    doc.setFontSize(10);
    doc.text(
      "Anillo Periférico contiguo a Residencial Suyapita, Tegucigalpa, Honduras, C.A.",
      pageWidth / 2,
      pageHeight - 40,
      { align: "center" }
    );
    doc.text("PBX (504) 2236-0900 / www.hospitalmaria.org", pageWidth / 2, pageHeight - 25, {
      align: "center",
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginX, pageHeight - 10, {
        align: "right",
      });
    }

    doc.save(`carnet_vacunacion_${dni}.pdf`);
  } catch (error) {
    alert(error);
  }
}
