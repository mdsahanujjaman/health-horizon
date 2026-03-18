import { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, Download, Trash2, Loader2, FileIcon, X, Plus } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

const MedicalRecords = ({ patientId, isReadOnly = false }) => {
  const { addToast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await api.get(`/medical-records/patient/${patientId}`);
      setRecords(res.data);
    } catch (err) {
      console.error('Failed to fetch records', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    fetchRecords();
  }, [patientId, fetchRecords]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', description);

    try {
      await api.post('/medical-records/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowUploadModal(false);
      setDescription('');
      setSelectedFile(null);
      fetchRecords();
    } catch (err) {
      console.error('Upload failed', err);
      addToast('Record synchronization failed. Check connectivity.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const response = await api.get(`/medical-records/download/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Medical Records
        </h3>
        {!isReadOnly && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-primary/25 font-medium"
          >
            <Plus className="w-5 h-5" />
            Upload New
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <FileIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-gray-900 font-medium">No records found</h4>
            <p className="text-gray-500 text-sm">Upload your medical documents here.</p>
          </div>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <FileIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 line-clamp-1">{record.fileName}</h4>
                    <p className="text-sm text-gray-500 mb-1">
                      {record.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>{new Date(record.uploadDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{(record.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(record.id, record.fileName)}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setShowUploadModal(false)}
          ></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Upload Record</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">File Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Blood Test Result, MRI Scan"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Select Document</label>
                <div className="relative group">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-primary/50 transition-all group"
                  >
                    <Upload
                      className={`w-8 h-8 ${selectedFile ? 'text-primary' : 'text-gray-400'} mb-2`}
                    />
                    <p className="text-sm font-medium text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to select or drag & drop'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-sky-600 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Confirm Upload
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
