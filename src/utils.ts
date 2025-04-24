import { DateInfo } from "./types.ts";

export function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, char => 
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char] || char));
}

export function parseCustomDate(dateInput: Date | string): DateInfo {
  const now = new Date();
  
  const fallback: DateInfo = {
    display: now.toLocaleString("pt-BR"),
    iso: now.toISOString(),
    obj: now
  };

  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return formatDateInfo(dateInput);
  }

  if (typeof dateInput !== 'string' || !dateInput || dateInput === "ND") {
    return fallback;
  }

  try {
    // Formato "DD/MM/YYYY HHhMM"
    if (/^\d{2}\/\d{2}\/\d{4} \d{2}h\d{2}$/.test(dateInput)) {
      const [datePart, timePart] = dateInput.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hours, minutes] = timePart.replace('h', ':').split(':').map(Number);
      
      const dateObj = new Date(year, month - 1, day, hours || 0, minutes || 0);
      
      if (!isNaN(dateObj.getTime())) {
        return {
          display: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')}`,
          iso: dateObj.toISOString(),
          obj: dateObj
        };
      }
    }

    // Tenta parsear como ISO string
    const dateObj = new Date(dateInput);
    if (!isNaN(dateObj.getTime())) {
      return formatDateInfo(dateObj);
    }

    throw new Error(`Formato não reconhecido: ${dateInput}`);
  } catch (e) {
    console.warn(`⚠️ Erro ao parsear data:`, e.message);
    return fallback;
  }
}

function formatDateInfo(date: Date): DateInfo {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return {
    display: `${day}/${month}/${year} ${hours}h${minutes}`,
    iso: date.toISOString(),
    obj: date
  };
}