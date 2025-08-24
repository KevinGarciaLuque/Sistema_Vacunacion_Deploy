//Carnet Simplet
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoIzquierdo from "../../assets/logo_izquierdo.png";
import logoDerecho from "../../assets/logo_derecho.png";
import selloEpidemiologia from "../../assets/sello_epidemiologia.png";

export async function generarCarnetSimplePDF({ historial, usuario, dni }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const marginX = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let selloWidth = 180;
  let selloHeight = 180;
  const selloOffsetX = 0;
  const selloOffsetY = 20;
  const margenInferior = 80;

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

    // ✅ DATOS DEL PACIENTE CON CARGO CORREGIDO
    const datos = [
      [
        { content: "Nombre completo:", styles: { fontStyle: "bold" } },
        usuario?.nombre_completo || "—",
        { content: "DNI:", styles: { fontStyle: "bold" } },
        dni || "—"
      ],
      [
        { content: "Edad:", styles: { fontStyle: "bold" } },
        usuario?.edad?.toString() || "—",
        { content: "Fecha nacimiento:", styles: { fontStyle: "bold" } },
        formatDate(usuario?.fecha_nacimiento)
      ],
      [
        { content: "Teléfono:", styles: { fontStyle: "bold" } },
        usuario?.telefono || "—",
        { content: "Correo:", styles: { fontStyle: "bold" } },
        usuario?.correo || "—"
      ],
      [
        { content: "Área laboral:", styles: { fontStyle: "bold" } },
        usuario?.area_laboral || "—",
        { content: "Cargo:", styles: { fontStyle: "bold" } },
        usuario?.cargo || "—",
      ],
      [
      
        { content: "Dirección:", styles: { fontStyle: "bold" } },
        usuario?.direccion || "—"
      ]
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

    const vacunasMap = {};
    historial.forEach((v) => {
      const vacuna = v.nombre_vacuna || "N/A";
      const fecha = formatDate(v.fecha_aplicacion);
      if (!vacunasMap[vacuna]) vacunasMap[vacuna] = [];
      vacunasMap[vacuna].push(fecha);
    });

    Object.keys(vacunasMap).forEach((vacuna) => {
      vacunasMap[vacuna].sort((a, b) => {
        const [da, ma, ya] = a.split("/");
        const [db, mb, yb] = b.split("/");
        return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`);
      });
    });

    const vacunasEntries = Object.entries(vacunasMap);
    const maxFechasPorPagina = 6;
    const totalPaginas = Math.ceil(Math.max(...vacunasEntries.map(([_, fechas]) => fechas.length)) / maxFechasPorPagina);

    for (let pagina = 0; pagina < totalPaginas; pagina++) {
      if (pagina > 0) {
        doc.addPage();
        addHeader();
      }

      const head = [["VACUNA", ...Array(maxFechasPorPagina).fill("FECHA")]];
      const body = vacunasEntries.map(([vacuna, fechas]) => {
        const fechasBloque = fechas.slice(pagina * maxFechasPorPagina, (pagina + 1) * maxFechasPorPagina);
        const row = [vacuna, ...fechasBloque];
        while (row.length < maxFechasPorPagina + 1) row.push("");
        return row;
      });

      let posY = pagina === 0 ? doc.lastAutoTable.finalY + 20 : 180;

      autoTable(doc, {
        startY: posY,
        margin: { left: marginX, right: marginX },
        head,
        body: body.length > 0 ? body : [["Sin registros", "", "", "", "", "", ""]],
        theme: "grid",
        styles: { fontSize: 11, cellPadding: 6 },
        headStyles: { fillColor: [0, 51, 153], textColor: 255, fontStyle: "bold" },
      });
    }

    let firmaY = doc.lastAutoTable.finalY + 30;
    let espacioDisponible = pageHeight - firmaY - margenInferior;

    if (espacioDisponible < selloHeight + 60) {
      if (espacioDisponible >= 180 + 60) {
        selloHeight = 180;
        selloWidth = 180;
      } else {
        doc.addPage();
        addHeader();
        firmaY = 180;
      }
    }

    const selloY = firmaY + selloOffsetY;
    const selloX = marginX;
    doc.addImage(selloBase64, "PNG", selloX, selloY, selloWidth, selloHeight);

    const lineaY = selloY + selloHeight - 15;
    const lineaXInicio = selloX + 20;
    const lineaXFin = selloX + selloWidth - 20;
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.line(lineaXInicio, lineaY, lineaXFin, lineaY);

    const textY = lineaY + 15;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Unidad de Epidemiología", selloX + 20, textY);

    doc.setFont("helvetica", "normal");
    doc.text("Hospital María, Especialidades Pediátricas", selloX + 20, textY + 15);

    doc.setFontSize(10);
    doc.text("Anillo Periférico contiguo a Residencial Suyapita, Tegucigalpa, Honduras, C.A.", pageWidth / 2, pageHeight - 40, { align: "center" });
    doc.text("PBX (504) 2236-0900 / www.hospitalmaria.org", pageWidth / 2, pageHeight - 25, { align: "center" });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginX, pageHeight - 10, { align: "right" });
    }

    doc.save(`carnet_vacunacion_simple_${dni}.pdf`);
  } catch (error) {
    alert(error);
  }
}
