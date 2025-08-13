import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import EditableText from '@/components/ui/editable-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataRow } from '@/types/dashboard';

interface DataTableProps {
  data: DataRow[];
}

export default function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const columns = useMemo(() => {
    if (!data.length) return [];
    return Object.keys(data[0]);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchTerm && selectedColumn === 'all') return data;

    return data.filter(row => {
      const searchMatch = searchTerm === '' || 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );

      const columnMatch = selectedColumn === 'all' || 
        String(row[selectedColumn]).toLowerCase().includes(searchTerm.toLowerCase());

      return searchMatch && (selectedColumn === 'all' || columnMatch);
    });
  }, [data, searchTerm, selectedColumn]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  const getStatus = (row: DataRow) => {
    // Try to determine status from common status columns
    const statusColumn = columns.find(col => 
      col.toLowerCase().includes('status') || 
      col.toLowerCase().includes('state') ||
      col.toLowerCase().includes('active')
    );
    
    if (statusColumn) {
      const status = String(row[statusColumn]).toLowerCase();
      if (status.includes('active') || status.includes('true') || status === '1') {
        return { label: 'Active', color: 'green' };
      } else if (status.includes('pending') || status.includes('limited')) {
        return { label: 'Limited', color: 'yellow' };
      } else {
        return { label: 'Inactive', color: 'red' };
      }
    }
    
    return { label: 'Unknown', color: 'gray' };
  };

  if (!data.length) return null;

  return (
    <Card data-testid="card-data-table">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="mb-4 sm:mb-0">
            <EditableText 
              initialValue="Data Table" 
              as="h3" 
              className="text-lg font-semibold" 
            />
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
                data-testid="input-search-table"
              />
            </div>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger className="w-40" data-testid="select-filter-column">
                <SelectValue placeholder="All Columns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Columns</SelectItem>
                {columns.map(column => (
                  <SelectItem key={column} value={column}>{column}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left" data-testid="table-data">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.slice(0, 6).map(column => (
                  <th key={column} className="px-6 py-3" data-testid={`header-${column}`}>
                    {column}
                  </th>
                ))}
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((row, index) => {
                const status = getStatus(row);
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700" data-testid={`row-${index}`}>
                    {columns.slice(0, 6).map(column => (
                      <td key={column} className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white" data-testid={`cell-${column}-${index}`}>
                        {formatValue(row[column])}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        status.color === 'green' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        status.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        status.color === 'red' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                      }`} data-testid={`status-${index}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-pagination-info">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{' '}
            <span className="font-medium">{filteredData.length}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              data-testid="button-pagination-previous"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={currentPage === pageNum ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? "bg-turquoise-400 text-white" : ""}
                  data-testid={`button-pagination-${pageNum}`}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              data-testid="button-pagination-next"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
