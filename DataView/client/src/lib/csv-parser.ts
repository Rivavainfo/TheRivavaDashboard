import { DataRow } from '@/types/dashboard';

export async function parseCSV(file: File): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file must contain at least a header and one data row');
        }

        // Parse header
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        
        // Parse data rows
        const data: DataRow[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
          
          if (values.length !== headers.length) {
            console.warn(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
            continue;
          }
          
          const row: DataRow = {};
          headers.forEach((header, index) => {
            let value: any = values[index];
            
            // Try to convert to number if possible
            if (!isNaN(Number(value)) && value !== '') {
              value = Number(value);
            } else if (value.toLowerCase() === 'true') {
              value = true;
            } else if (value.toLowerCase() === 'false') {
              value = false;
            }
            
            row[header] = value;
          });
          
          data.push(row);
        }
        
        if (data.length === 0) {
          throw new Error('No valid data rows found in CSV file');
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read CSV file'));
    };
    
    reader.readAsText(file);
  });
}

export function exportToCSV(data: DataRow[], filename: string = 'export') {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : String(value);
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
