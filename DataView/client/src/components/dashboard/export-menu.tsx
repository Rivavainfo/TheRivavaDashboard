import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF } from '@/lib/pdf-export';
import { exportToCSV } from '@/lib/csv-parser';
import { DataRow } from '@/types/dashboard';

interface ExportMenuProps {
  data: DataRow[];
}

export default function ExportMenu({ data }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handlePDFExport = async () => {
    if (!data.length) {
      toast({
        title: 'No Data to Export',
        description: 'Please load data before exporting.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF(data, 'dashboard-report');
      toast({
        title: 'PDF Export Successful',
        description: 'Your dashboard report has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'PDF Export Failed',
        description: 'There was an error generating the PDF report.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCSVExport = async () => {
    if (!data.length) {
      toast({
        title: 'No Data to Export',
        description: 'Please load data before exporting.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      exportToCSV(data, 'dashboard-data');
      toast({
        title: 'CSV Export Successful',
        description: 'Your data has been exported as CSV.',
      });
    } catch (error) {
      toast({
        title: 'CSV Export Failed',
        description: 'There was an error exporting the CSV file.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className="bg-turquoise-400 hover:bg-turquoise-500 text-white hover-lift"
          disabled={isExporting}
          data-testid="button-export"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handlePDFExport} data-testid="button-export-pdf">
          <FileText className="w-4 h-4 mr-3" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCSVExport} data-testid="button-export-csv">
          <FileSpreadsheet className="w-4 h-4 mr-3" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
