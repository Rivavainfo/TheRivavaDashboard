import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseCSV } from '@/lib/csv-parser';
import { connectToFirebase } from '@/lib/firebase';
import { DataSource } from '@/types/dashboard';

interface DataSourceSelectorProps {
  onDataSourceUpdate: (dataSource: DataSource) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function DataSourceSelector({ onDataSourceUpdate, onLoadingChange }: DataSourceSelectorProps) {
  const [firebaseProjectId, setFirebaseProjectId] = useState('');
  const [firebaseCollection, setFirebaseCollection] = useState('');
  const { toast } = useToast();

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File Format',
        description: 'Please upload a valid CSV file.',
        variant: 'destructive',
      });
      return;
    }

    onLoadingChange(true);
    
    try {
      const data = await parseCSV(file);
      onDataSourceUpdate({
        type: 'csv',
        data,
        lastUpdated: new Date(),
        isConnected: true,
      });
      
      toast({
        title: 'CSV Uploaded Successfully',
        description: `Loaded ${data.length} records from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: 'CSV Parse Error',
        description: 'Failed to parse CSV file. Please check the format and try again.',
        variant: 'destructive',
      });
    } finally {
      onLoadingChange(false);
    }
  };

  const handleFirebaseConnect = async () => {
    if (!firebaseProjectId.trim() || !firebaseCollection.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both Project ID and Collection Name.',
        variant: 'destructive',
      });
      return;
    }

    onLoadingChange(true);

    try {
      const data = await connectToFirebase(firebaseProjectId, firebaseCollection);
      onDataSourceUpdate({
        type: 'firebase',
        data,
        lastUpdated: new Date(),
        isConnected: true,
      });

      toast({
        title: 'Firebase Connected',
        description: `Successfully connected to ${firebaseProjectId}/${firebaseCollection}`,
      });
    } catch (error) {
      toast({
        title: 'Firebase Connection Error',
        description: 'Failed to connect to Firebase. Please check your credentials.',
        variant: 'destructive',
      });
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Data Source</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* CSV Upload */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-turquoise-400 dark:hover:border-turquoise-400 transition-colors hover-lift">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload CSV File</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Drop your CSV file here or click to browse</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
                id="csv-upload"
                data-testid="input-csv-file"
              />
              <Button 
                onClick={() => document.getElementById('csv-upload')?.click()}
                className="bg-turquoise-400 hover:bg-turquoise-500"
                data-testid="button-csv-upload"
              >
                Choose File
              </Button>
            </div>
          </div>

          {/* Firebase Connection */}
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-turquoise-400 dark:hover:border-turquoise-400 transition-colors hover-lift">
            <div className="text-center">
              <Database className="mx-auto h-12 w-12 text-orange-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Connect to Firebase</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Enter your Project ID and Collection Name</p>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Firebase Project ID"
                  value={firebaseProjectId}
                  onChange={(e) => setFirebaseProjectId(e.target.value)}
                  data-testid="input-firebase-project-id"
                />
                <Input
                  type="text"
                  placeholder="Collection Name"
                  value={firebaseCollection}
                  onChange={(e) => setFirebaseCollection(e.target.value)}
                  data-testid="input-firebase-collection"
                />
                <Button 
                  onClick={handleFirebaseConnect}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  data-testid="button-firebase-connect"
                >
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
